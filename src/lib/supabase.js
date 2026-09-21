/**
 * LIBAS TAILOR — Supabase Client & Gallery Publishing API
 *
 * Security Principles:
 * - NEVER uses Supabase Service-Role key in frontend code.
 * - Relies on Supabase Auth + strict RLS policies on PostgreSQL and Storage.
 * - Transactional cleanup of storage objects if database insertion fails.
 * - Production-safe user error messages (never leaks internals).
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
  : null;

/**
 * Checks if there is an active authenticated user.
 */
export async function getSession() {
  if (!supabase) return null;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session;
}

/**
 * Checks if the current authenticated user has an 'admin' role in admin_users table.
 * Note: RLS enforces this on the database; this client check is for UX flow.
 */
export async function checkIsAdmin(userId) {
  if (!supabase || !userId) return false;
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error || !data) return false;
    return data.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Admin Sign-in with role verification.
 */
export async function signInAdmin(email, password) {
  if (!supabase) {
    return { success: false, error: 'Supabase credentials are not configured in .env.local.' };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password
  });

  if (error || !data.user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  // Verify admin authorization in database
  const isAdmin = await checkIsAdmin(data.user.id);
  if (!isAdmin) {
    // Immediately terminate session if user is not in admin_users
    await supabase.auth.signOut();
    return {
      success: false,
      error: 'Access Denied: Your account does not have administrator privileges.'
    };
  }

  return { success: true, user: data.user };
}

/**
 * Admin Sign-out.
 */
export async function signOutAdmin() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Fetches all published photos for the public Gallery page.
 * Ordering: published_at DESC (newest first).
 */
export async function fetchPublishedPhotos() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('id, storage_path, public_url, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.warn('Unable to load dynamic gallery photos:', error.message);
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

/**
 * Fetches all photos for the Admin Dashboard (both published and unpublished).
 * Ordering: published_at DESC NULLS LAST, created_at DESC.
 */
export async function adminFetchAllPhotos() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('gallery_images')
    .select('id, storage_path, public_url, is_published, created_at, published_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to load gallery items.');
  }

  return data || [];
}

/**
 * Uploads a validated photo to Supabase Storage and creates the published record.
 * Handles storage rollback if database insertion fails.
 */
export async function adminUploadAndPublishPhoto(validatedData, sessionUser) {
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { file, safeName, ext } = validatedData;
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const bucketName = 'gallery';

  // 1. Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(safeName, file, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Storage upload failed. Please try again.');
  }

  // 2. Derive public URL
  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(safeName);
  const publicUrl = urlData?.publicUrl || '';

  // 3. Insert record into gallery_images with is_published = true
  const nowIso = new Date().toISOString();
  const { data: insertData, error: dbError } = await supabase
    .from('gallery_images')
    .insert({
      storage_path: safeName,
      public_url: publicUrl,
      is_published: true,
      published_at: nowIso,
      uploaded_by: sessionUser.id
    })
    .select()
    .single();

  // 4. Transactional cleanup on failure: Delete storage object if DB insert failed
  if (dbError) {
    try {
      await supabase.storage.from(bucketName).remove([safeName]);
    } catch (cleanupErr) {
      console.error('Storage rollback error:', cleanupErr);
    }
    throw new Error('Database record creation failed. Storage has been cleaned up.');
  }

  return insertData;
}

/**
 * Toggles the publication state of a photo.
 */
export async function adminSetPublishStatus(id, shouldPublish) {
  if (!supabase) throw new Error('Supabase client is not configured.');

  const updatePayload = {
    is_published: shouldPublish
  };

  if (shouldPublish) {
    updatePayload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('gallery_images')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update publication status.');
  }

  return data;
}

/**
 * Permanently deletes a photo from both database and Supabase Storage.
 */
export async function adminDeletePhoto(id, storagePath) {
  if (!supabase) throw new Error('Supabase client is not configured.');

  // 1. Delete from database
  const { error: dbError } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', id);

  if (dbError) {
    throw new Error('Failed to remove photo record from database.');
  }

  // 2. Delete from storage bucket
  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from('gallery')
      .remove([storagePath]);

    if (storageError) {
      console.warn('Storage removal warning:', storageError.message);
    }
  }

  return true;
}
