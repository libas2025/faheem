/**
 * LIBAS TAILOR — Gallery Admin Controller
 *
 * Implements strict client-side auth guard, file validation (<2MB, magic byte),
 * upload to Supabase Storage, publishing to gallery_images table, unpublish, and deletion.
 */

import {
  getSession,
  checkIsAdmin,
  signOutAdmin,
  adminFetchAllPhotos,
  adminUploadAndPublishPhoto,
  adminSetPublishStatus,
  adminDeletePhoto,
  isSupabaseConfigured
} from './lib/supabase.js';

import { validateGalleryImage, formatBytes } from './lib/imageValidator.js';

// State
let currentSessionUser = null;
let currentValidatedFile = null;
let pendingDeleteTarget = null; // { id, storagePath }

// DOM Elements
const authStatusEmail = document.getElementById('admin-user-email');
const logoutBtn = document.getElementById('admin-logout-btn');
const dropzone = document.getElementById('upload-dropzone');
const fileInput = document.getElementById('photo-file-input');
const browseBtn = document.getElementById('browse-files-btn');
const previewCard = document.getElementById('upload-preview-card');
const previewImg = document.getElementById('preview-image');
const previewSize = document.getElementById('preview-file-size');
const previewType = document.getElementById('preview-file-type');
const previewStatus = document.getElementById('preview-status-badge');
const publishBtn = document.getElementById('publish-photo-btn');
const publishBtnText = document.getElementById('publish-btn-text');
const publishSpinner = document.getElementById('publish-spinner');
const toastNotification = document.getElementById('admin-toast');
const photosGrid = document.getElementById('admin-photos-grid');
const emptyPhotosState = document.getElementById('admin-empty-state');
const loadingPhotosState = document.getElementById('admin-loading-state');
const deleteModal = document.getElementById('delete-confirm-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

/**
 * Toast feedback helper
 */
let toastTimeout = null;
function showToast(message, isError = false) {
  if (!toastNotification) return;
  if (toastTimeout) clearTimeout(toastTimeout);

  toastNotification.textContent = message;
  toastNotification.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded text-xs font-semibold shadow-xl transition-all duration-300 transform translate-y-0 ${
    isError ? 'bg-red-700 text-white' : 'bg-burgundy-royal text-white border border-antique-gold/40'
  }`;
  toastNotification.classList.remove('hidden');

  toastTimeout = setTimeout(() => {
    toastNotification.classList.add('hidden');
  }, 4000);
}

/**
 * Enforce Auth Guard
 */
async function enforceAuthGuard() {
  if (!isSupabaseConfigured) {
    showToast('Supabase environment variables are missing.', true);
    return false;
  }

  const session = await getSession();
  if (!session || !session.user) {
    window.location.replace('/admin/login.html');
    return false;
  }

  const isAdmin = await checkIsAdmin(session.user.id);
  if (!isAdmin) {
    await signOutAdmin();
    window.location.replace('/admin/login.html');
    return false;
  }

  currentSessionUser = session.user;
  if (authStatusEmail) {
    authStatusEmail.textContent = session.user.email || 'libastailor0@gmail.com';
  }

  return true;
}

/**
 * Reset Upload Area
 */
function resetUploadState() {
  currentValidatedFile = null;
  fileInput.value = '';
  previewCard.classList.add('hidden');
  previewImg.src = '';
  publishBtn.disabled = true;
  publishBtn.classList.add('opacity-50', 'cursor-not-allowed');
}

/**
 * Process and Validate Selected File
 */
async function handleFileSelection(file) {
  if (!file) return;

  resetUploadState();
  previewCard.classList.remove('hidden');
  previewStatus.textContent = 'Validating...';
  previewStatus.className = 'inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-charcoal';

  // Preview local object URL immediately for UX
  const objectUrl = URL.createObjectURL(file);
  previewImg.src = objectUrl;
  previewSize.textContent = formatBytes(file.size);
  previewType.textContent = (file.type || 'Unknown').replace('image/', '').toUpperCase();

  const validation = await validateGalleryImage(file);

  if (!validation.valid) {
    previewStatus.textContent = validation.error;
    previewStatus.className = 'inline-block px-2.5 py-1 rounded text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200';
    publishBtn.disabled = true;
    publishBtn.classList.add('opacity-50', 'cursor-not-allowed');
    showToast(validation.error, true);
    return;
  }

  // File is valid and ready
  currentValidatedFile = validation;
  previewStatus.textContent = 'Ready to publish (< 2 MB & verified format)';
  previewStatus.className = 'inline-block px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300';
  publishBtn.disabled = false;
  publishBtn.classList.remove('opacity-50', 'cursor-not-allowed');
}

/**
 * Load Photos for Dashboard
 */
async function loadPhotos() {
  if (!photosGrid) return;
  loadingPhotosState.classList.remove('hidden');
  emptyPhotosState.classList.add('hidden');
  photosGrid.innerHTML = '';

  try {
    const photos = await adminFetchAllPhotos();
    loadingPhotosState.classList.add('hidden');

    if (!photos || photos.length === 0) {
      emptyPhotosState.classList.remove('hidden');
      return;
    }

    renderPhotosGrid(photos);
  } catch (err) {
    loadingPhotosState.classList.add('hidden');
    showToast('Failed to load photos.', true);
  }
}

/**
 * Render Photos in Admin Grid
 */
function renderPhotosGrid(photos) {
  photosGrid.innerHTML = '';

  photos.forEach(item => {
    const card = document.createElement('div');
    card.className = 'admin-photo-card bg-white border border-charcoal/10 rounded-sm overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow';

    const publishedDateFormatted = item.published_at
      ? new Date(item.published_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Not published';

    const isPub = item.is_published;

    card.innerHTML = `
      <div class="relative aspect-[3/4] bg-neutral-100 overflow-hidden group">
        <img
          src="${item.public_url}"
          alt="Gallery item"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <div class="absolute top-2 left-2">
          <span class="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded ${
            isPub
              ? 'bg-burgundy-royal text-white border border-antique-gold/40'
              : 'bg-charcoal/80 text-white'
          }">
            ${isPub ? 'PUBLISHED' : 'UNPUBLISHED'}
          </span>
        </div>
      </div>

      <div class="p-4 flex flex-col justify-between flex-1">
        <div class="mb-4">
          <p class="text-[11px] text-charcoal/60 uppercase tracking-wider font-semibold mb-1">
            ${isPub ? 'Published' : 'Created'}
          </p>
          <p class="text-xs text-charcoal font-medium">
            ${publishedDateFormatted}
          </p>
        </div>

        <div class="pt-3 border-t border-charcoal/10 flex items-center justify-between gap-2">
          <button
            type="button"
            class="toggle-pub-btn text-xs font-semibold py-1.5 px-3 rounded border transition-colors ${
              isPub
                ? 'border-charcoal/20 text-charcoal/80 hover:bg-charcoal/5'
                : 'border-burgundy-royal text-burgundy-royal hover:bg-burgundy-royal/5'
            }"
            data-id="${item.id}"
            data-published="${isPub}"
          >
            ${isPub ? 'Unpublish' : 'Publish'}
          </button>

          <button
            type="button"
            class="delete-btn text-xs font-semibold text-red-600 hover:text-red-800 py-1.5 px-2.5 rounded hover:bg-red-50 transition-colors"
            data-id="${item.id}"
            data-storage="${item.storage_path}"
          >
            Delete
          </button>
        </div>
      </div>
    `;

    // Bind Toggle Publish
    const toggleBtn = card.querySelector('.toggle-pub-btn');
    toggleBtn.addEventListener('click', async () => {
      const id = toggleBtn.getAttribute('data-id');
      const currentlyPublished = toggleBtn.getAttribute('data-published') === 'true';
      toggleBtn.disabled = true;
      toggleBtn.textContent = 'Updating...';

      try {
        await adminSetPublishStatus(id, !currentlyPublished);
        showToast(!currentlyPublished ? 'Photo published to public gallery.' : 'Photo unpublished from public gallery.');
        await loadPhotos();
      } catch {
        showToast('Failed to update status.', true);
        toggleBtn.disabled = false;
        toggleBtn.textContent = currentlyPublished ? 'Unpublish' : 'Publish';
      }
    });

    // Bind Delete
    const delBtn = card.querySelector('.delete-btn');
    delBtn.addEventListener('click', () => {
      const id = delBtn.getAttribute('data-id');
      const storagePath = delBtn.getAttribute('data-storage');
      openDeleteConfirmation(id, storagePath);
    });

    photosGrid.appendChild(card);
  });
}

/**
 * Delete Confirmation Modal Handlers
 */
function openDeleteConfirmation(id, storagePath) {
  pendingDeleteTarget = { id, storagePath };
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  pendingDeleteTarget = null;
  deleteModal.classList.add('hidden');
}

if (cancelDeleteBtn) {
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
}

if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener('click', async () => {
    if (!pendingDeleteTarget) return;

    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.textContent = 'Deleting...';

    try {
      await adminDeletePhoto(pendingDeleteTarget.id, pendingDeleteTarget.storagePath);
      showToast('Photo permanently deleted from gallery.');
      closeDeleteModal();
      await loadPhotos();
    } catch {
      showToast('Failed to delete photo.', true);
    } finally {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.textContent = 'Yes, Delete Permanently';
    }
  });
}

/**
 * Publish Button Handler
 */
if (publishBtn) {
  publishBtn.addEventListener('click', async () => {
    if (!currentValidatedFile || !currentSessionUser) return;

    publishBtn.disabled = true;
    publishBtnText.textContent = 'PUBLISHING PHOTO...';
    publishSpinner.classList.remove('hidden');

    try {
      await adminUploadAndPublishPhoto(currentValidatedFile, currentSessionUser);
      showToast('Photo successfully published to public gallery!');
      resetUploadState();
      await loadPhotos();
    } catch (err) {
      showToast(err.message || 'Upload failed. Please try again.', true);
    } finally {
      publishBtn.disabled = false;
      publishBtnText.textContent = 'PUBLISH PHOTO';
      publishSpinner.classList.add('hidden');
    }
  });
}

/**
 * Drag & Drop and File Input Bindings
 */
if (browseBtn && fileInput) {
  browseBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelection(file);
  });
}

if (dropzone) {
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('border-burgundy-royal', 'bg-burgundy-royal/5');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-burgundy-royal', 'bg-burgundy-royal/5');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelection(file);
  });
}

/**
 * Logout Handler
 */
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await signOutAdmin();
    window.location.replace('/admin/login.html');
  });
}

/**
 * App Initialization
 */
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthorized = await enforceAuthGuard();
  if (isAuthorized) {
    await loadPhotos();
  }
});
