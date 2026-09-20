import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Libas Brand Colors:
// Royal Burgundy: #55100F (deep rich imperial red-burgundy)
// Dark Atelier Burgundy: #3D0B0A
// Antique Atelier Gold: #C6A15B (lustrous warm metallic gold)
// Radiant Gold Highlight: #F5E2B3 / #DFBA73
// Warm Ivory: #FAF7F0

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Rich Imperial Burgundy Gradient for Atelier Badge -->
    <linearGradient id="libasBurgundy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6B1615" />
      <stop offset="35%" stop-color="#55100F" />
      <stop offset="70%" stop-color="#3D0B0A" />
      <stop offset="100%" stop-color="#240505" />
    </linearGradient>

    <!-- Radiant Antique Gold Metallic Gradient -->
    <linearGradient id="antiqueGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF0D0" />
      <stop offset="25%" stop-color="#E8CA88" />
      <stop offset="60%" stop-color="#C6A15B" />
      <stop offset="85%" stop-color="#A57D36" />
      <stop offset="100%" stop-color="#7D5B20" />
    </linearGradient>

    <!-- Subtle Bevel Gradient for Border -->
    <linearGradient id="goldBorder" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8E6928" />
      <stop offset="50%" stop-color="#DFBA73" />
      <stop offset="100%" stop-color="#FFF2D6" />
    </linearGradient>

    <!-- Soft Depth Shadow -->
    <filter id="monogramDepth" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.55" />
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Luxury Atelier Squircle Base -->
  <rect x="20" y="20" width="472" height="472" rx="112" fill="url(#libasBurgundy)" />

  <!-- Outer Polished Gold Rim -->
  <rect x="24" y="24" width="464" height="464" rx="108" fill="none" stroke="url(#goldBorder)" stroke-width="7" />

  <!-- Inner Refined Atelier Filigree Frame -->
  <rect x="40" y="40" width="432" height="432" rx="94" fill="none" stroke="url(#antiqueGold)" stroke-width="2" stroke-opacity="0.5" stroke-dasharray="8 4" />

  <!-- Atelier Diamond Star / Royal Crest Accent -->
  <g filter="url(#monogramDepth)">
    <path d="M 216 68 L 223 85 L 240 92 L 223 99 L 216 116 L 209 99 L 192 92 L 209 85 Z" fill="url(#antiqueGold)" />
  </g>

  <!-- High-Fashion Editorial Monogram Letter 'L' (Handcrafted Royal Serif Silhouette) -->
  <g filter="url(#monogramDepth)">
    <!-- Main Letter L Vector Path -->
    <path d="
      M 160 136
      L 248 136
      C 245 152 238 162 226 168
      L 226 348
      C 226 360 234 366 250 366
      L 318 366
      C 346 366 364 360 376 344
      C 384 332 388 316 392 296
      L 410 298
      L 398 390
      L 142 390
      L 142 372
      C 158 370 166 362 166 346
      L 166 180
      C 166 164 158 156 142 154
      L 142 136
      Z
    " fill="url(#antiqueGold)" />
  </g>
</svg>`;

async function buildFavicons() {
  const publicDir = path.resolve('public');
  const imagesDir = path.join(publicDir, 'images');

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

  // 1. Save standard SVG favicon
  const svgPath = path.join(publicDir, 'favicon.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  console.log('Created:', svgPath);

  // Also save in images/ for full compatibility
  fs.writeFileSync(path.join(imagesDir, 'favicon.svg'), svgContent, 'utf-8');

  const svgBuffer = Buffer.from(svgContent);

  // 2. Generate PNGs at required standard sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'favicon.png', size: 64 }
  ];

  const pngBuffers = {};

  for (const item of sizes) {
    const outPath = path.join(publicDir, item.name);
    const buf = await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png({ compressionLevel: 9 })
      .toBuffer();

    fs.writeFileSync(outPath, buf);
    pngBuffers[item.size] = buf;
    console.log(`Generated ${item.name} (${item.size}x${item.size})`);

    // Duplicate in images/ directory as well
    fs.writeFileSync(path.join(imagesDir, item.name), buf);
  }

  // 3. Generate multi-size favicon.ico
  // A valid ICO file containing 16x16, 32x32, and 48x48 PNG frames
  const icoSizes = [16, 32, 48];
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(icoSizes.length, 4); // Number of images

  let offset = 6 + (16 * icoSizes.length);
  const dirEntries = [];
  const imageBuffers = [];

  for (const size of icoSizes) {
    const pngBuf = pngBuffers[size];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0); // Width
    entry.writeUInt8(size, 1); // Height
    entry.writeUInt8(0, 2);    // Palette size
    entry.writeUInt8(0, 3);    // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6);// Bits per pixel
    entry.writeUInt32LE(pngBuf.length, 8);  // Image size in bytes
    entry.writeUInt32LE(offset, 12);        // File offset
    
    dirEntries.push(entry);
    imageBuffers.push(pngBuf);
    offset += pngBuf.length;
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...imageBuffers]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(imagesDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico (multi-resolution 16/32/48)');

  // 4. Create web app manifest linking the icons
  const manifest = {
    name: "LIBAS TAILOR — Royal Bespoke Menswear",
    short_name: "LIBAS TAILOR",
    description: "Royal bespoke menswear, ceremonial Sherwanis, and luxury tailoring in Aligarh.",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ],
    theme_color: "#55100F",
    background_color: "#FAF7F0",
    display: "standalone",
    start_url: "/"
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf-8');
  console.log('Generated site.webmanifest');
}

buildFavicons().catch(err => {
  console.error('Favicon build failed:', err);
  process.exit(1);
});
