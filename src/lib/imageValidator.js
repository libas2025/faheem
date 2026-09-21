/**
 * LIBAS TAILOR — High-Security Image Validation & Sanitization Module
 *
 * Rules:
 * 1. File size strictly < 2 MB (2,097,152 bytes). Exactly 2 MB or above is rejected.
 * 2. Supported formats: JPEG, JPG, PNG only.
 * 3. Deep binary signature (Magic Bytes) inspection to defeat MIME spoofing, renamed PDFs, SVGs, or executables.
 * 4. Safe dimension checks to prevent decompression bombs or malformed zero-dimension images.
 * 5. Cryptographically secure random UUID storage filename generation (zero path traversal risk).
 */

export const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB = 2,097,152 bytes

/**
 * Validates the file strictly according to security requirements.
 * @param {File} file
 * @returns {Promise<{ valid: boolean, error?: string, file?: File, ext?: string, safeName?: string, dimensions?: { width: number, height: number } }>}
 */
export async function validateGalleryImage(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // 1. Strict Byte Limit (< 2 MB)
  if (file.size >= MAX_FILE_BYTES) {
    return {
      valid: false,
      error: 'Image must be smaller than 2 MB. (Selected: ' + (file.size / (1024 * 1024)).toFixed(2) + ' MB)'
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  // 2. Read first 16 bytes for Magic Number (binary signature) verification
  let headerBytes;
  try {
    const buffer = await readFileSlice(file, 0, 16);
    headerBytes = new Uint8Array(buffer);
  } catch {
    return { valid: false, error: 'Unable to read file contents.' };
  }

  const detectedFormat = detectFormatFromMagicBytes(headerBytes);
  if (!detectedFormat) {
    return {
      valid: false,
      error: 'Unsupported or corrupted image format. Only authentic JPG, JPEG, and PNG images are allowed.'
    };
  }

  // 3. Prevent SVG or PDF or HTML disguised as images
  if (detectedFormat === 'svg' || detectedFormat === 'pdf') {
    return {
      valid: false,
      error: 'Security rejection: ' + detectedFormat.toUpperCase() + ' files are not permitted.'
    };
  }

  // 4. Validate Dimensions & Loadability
  let dimensions;
  try {
    dimensions = await getImageDimensions(file);
    if (dimensions.width <= 0 || dimensions.height <= 0) {
      return { valid: false, error: 'Invalid or zero-dimension image.' };
    }
    // Prevent absurdly huge pixel dimensions (decompression bomb protection)
    if (dimensions.width > 6000 || dimensions.height > 6000) {
      return {
        valid: false,
        error: `Image dimensions (${dimensions.width}x${dimensions.height}) exceed maximum allowed 6000x6000px.`
      };
    }
  } catch {
    return { valid: false, error: 'Image file appears corrupted or unreadable.' };
  }

  // 5. Generate secure random filename
  const safeExt = detectedFormat === 'png' ? 'png' : 'jpg';
  const safeName = `${crypto.randomUUID()}.${safeExt}`;

  return {
    valid: true,
    file,
    ext: safeExt,
    safeName,
    dimensions
  };
}

/**
 * Reads a slice of a File as ArrayBuffer.
 */
async function readFileSlice(file, start, end) {
  const slice = file.slice(start, end);
  if (typeof slice.arrayBuffer === 'function') {
    return await slice.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(slice);
  });
}

/**
 * Detects actual file format from raw magic bytes.
 * JPEG: FF D8 FF
 * PNG: 89 50 4E 47 0D 0A 1A 0A
 * PDF: 25 50 44 46 (%PDF)
 */
function detectFormatFromMagicBytes(bytes) {
  // JPEG check: starts with FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'jpeg';
  }

  // PNG check: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4E &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0D &&
    bytes[5] === 0x0A &&
    bytes[6] === 0x1A &&
    bytes[7] === 0x0A
  ) {
    return 'png';
  }

  // PDF check: 25 50 44 46 (%PDF)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'pdf';
  }

  // Text / SVG check (starts with '<' or '<?xml')
  if (bytes[0] === 0x3C) {
    return 'svg';
  }

  return null;
}

/**
 * Loads the file in a browser Image object to verify pixel renderability and dimensions.
 */
function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for dimension verification.'));
    };
    img.src = url;
  });
}

/**
 * Formats bytes to user-friendly string (e.g., 1.42 MB).
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
