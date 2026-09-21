import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const MODEL_PATH = 'C:/Users/ahmad/.gemini/antigravity-ide/brain/315617ae-ce6e-429c-8e76-ab5914121142/sherwani_model_front_back_1789971163524.jpg';
const DEMO_PATH = 'C:/Users/ahmad/.gemini/antigravity-ide/brain/315617ae-ce6e-429c-8e76-ab5914121142/tape_measure_demonstrations_1789971328587.jpg';
const LOGO_PATH = 'd:/web projects/libas/public/images/logo.png';
const OUTPUT_PATH = 'd:/web projects/libas/public/images/libas-tailor-sherwani-measurement-guide.webp';

async function buildGuide() {
  console.log('Generating Libas Tailor Sherwani Measurement Guide...');

  const W = 2560;
  const H = 1600;

  // 1. Prepare Model image (Center area)
  // Resize model photo to fit nicely in our model zone: width 1540, height 1220
  const modelResized = await sharp(MODEL_PATH)
    .resize(1540, 1220, { fit: 'cover', position: 'center' })
    .toBuffer();

  // 2. Prepare Demo image insets
  const demoMeta = await sharp(DEMO_PATH).metadata();
  console.log('Demo original dimensions:', demoMeta.width, demoMeta.height);

  const dw = demoMeta.width;
  const dh = demoMeta.height;

  // Crop 6 distinct demonstration panels from the 6-panel grid:
  const cropNeck = await sharp(DEMO_PATH)
    .extract({ left: Math.floor(dw * 0.02), top: Math.floor(dh * 0.02), width: Math.floor(dw * 0.31), height: Math.floor(dh * 0.31) })
    .resize(320, 160, { fit: 'cover' })
    .toBuffer();

  const cropChest = await sharp(DEMO_PATH)
    .extract({ left: Math.floor(dw * 0.55), top: Math.floor(dh * 0.02), width: Math.floor(dw * 0.42), height: Math.floor(dh * 0.31) })
    .resize(320, 160, { fit: 'cover' })
    .toBuffer();

  const cropShoulder = await sharp(DEMO_PATH)
    .extract({ left: Math.floor(dw * 0.02), top: Math.floor(dh * 0.35), width: Math.floor(dw * 0.32), height: Math.floor(dh * 0.31) })
    .resize(320, 160, { fit: 'cover' })
    .toBuffer();

  const cropSleeve = await sharp(DEMO_PATH)
    .extract({ left: Math.floor(dw * 0.65), top: Math.floor(dh * 0.35), width: Math.floor(dw * 0.33), height: Math.floor(dh * 0.31) })
    .resize(320, 160, { fit: 'cover' })
    .toBuffer();

  const cropBicep = await sharp(DEMO_PATH)
    .extract({ left: Math.floor(dw * 0.02), top: Math.floor(dh * 0.68), width: Math.floor(dw * 0.32), height: Math.floor(dh * 0.30) })
    .resize(320, 160, { fit: 'cover' })
    .toBuffer();

  const cropWaist = await sharp(DEMO_PATH)
    .extract({ left: Math.floor(dw * 0.65), top: Math.floor(dh * 0.68), width: Math.floor(dw * 0.33), height: Math.floor(dh * 0.30) })
    .resize(320, 160, { fit: 'cover' })
    .toBuffer();

  // Logo
  const logoMeta = await sharp(LOGO_PATH).metadata();
  const logoW = Math.round((logoMeta.width / logoMeta.height) * 54);
  const logoResized = await sharp(LOGO_PATH)
    .resize(logoW, 54)
    .toBuffer();

  // SVG Overlay with Metrology Lines, Number Badges, Typography and Details
  const svgOverlay = `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
      <filter id="badge-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.4"/>
      </filter>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#DFBA73"/>
        <stop offset="50%" stop-color="#C6A15B"/>
        <stop offset="100%" stop-color="#9C7837"/>
      </linearGradient>
      <linearGradient id="burgundyGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6F1514"/>
        <stop offset="100%" stop-color="#460908"/>
      </linearGradient>
    </defs>

    <style>
      .title-main { font-family: 'Cinzel', 'Times New Roman', serif; font-size: 38px; font-weight: 700; fill: #55100F; letter-spacing: 0.12em; text-anchor: middle; }
      .title-sub { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 700; fill: #C6A15B; letter-spacing: 0.32em; text-anchor: middle; text-transform: uppercase; }
      .title-desc { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 16px; fill: #5D544E; letter-spacing: 0.05em; text-anchor: middle; }
      .panel-head { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; fill: #55100F; letter-spacing: 0.14em; }
      .panel-sub { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 600; fill: #C6A15B; letter-spacing: 0.18em; text-transform: uppercase; }
      .view-label { font-family: 'Cinzel', serif; font-size: 14px; font-weight: 700; fill: #FAF7F0; letter-spacing: 0.22em; text-anchor: middle; }
      .measure-line { stroke: #C6A15B; stroke-width: 2.2; stroke-dasharray: 6 3; }
      .measure-lead { stroke: #55100F; stroke-width: 1.8; opacity: 0.85; }
      .tag-bg { fill: #FAF7F0; stroke: #C6A15B; stroke-width: 1.2; rx: 4; }
      .tag-text { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; fill: #300807; }
      .tag-num { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 800; fill: #C6A15B; }
      .badge-circle { fill: url(#burgundyGrad); stroke: #C6A15B; stroke-width: 1.8; filter: url(#badge-shadow); }
      .badge-num { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 800; fill: #FFFFFF; text-anchor: middle; dominant-baseline: central; }
      .card-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; fill: #55100F; letter-spacing: 0.06em; }
      .card-step { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 700; fill: #C6A15B; }
      .card-desc { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; fill: #484039; }
      .footer-txt { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12.5px; fill: #6B6259; letter-spacing: 0.06em; }
      .footer-gold { font-weight: 700; fill: #55100F; }
    </style>

    <!-- Outer Double Luxury Border -->
    <rect x="18" y="18" width="${W - 36}" height="${H - 36}" fill="none" stroke="#C6A15B" stroke-width="2.5"/>
    <rect x="26" y="26" width="${W - 52}" height="${H - 52}" fill="none" stroke="#C6A15B" stroke-width="0.9" opacity="0.65"/>
    
    <!-- Corner Filigree Ornaments -->
    <path d="M18,48 L48,18 M18,54 L54,18 M18,36 L36,18" stroke="#C6A15B" stroke-width="1.2" opacity="0.5"/>
    <path d="M${W-18},48 L${W-48},18 M${W-18},54 L${W-54},18 M${W-18},36 L${W-36},18" stroke="#C6A15B" stroke-width="1.2" opacity="0.5"/>
    <path d="M18,${H-48} L48,${H-18} M18,${H-54} L54,${H-18} M18,${H-36} L36,${H-18}" stroke="#C6A15B" stroke-width="1.2" opacity="0.5"/>
    <path d="M${W-18},${H-48} L${W-48},${H-18} M${W-18},${H-54} L${W-54},${H-18} M${W-18},${H-36} L${W-36},${H-18}" stroke="#C6A15B" stroke-width="1.2" opacity="0.5"/>

    <!-- HEADER SECTION -->
    <text x="1280" y="74" class="title-main">LIBAS TAILOR</text>
    <text x="1280" y="102" class="title-sub">MEASUREMENT GUIDE &#8226; SHERWANI &amp; SUIT</text>
    <text x="1280" y="125" class="title-desc">Atelier Anatomical Metrology For Master Drape &#8226; Shamshad Market, AMU Aligarh</text>

    <!-- Header Decorative Needle Lines -->
    <line x1="560" y1="96" x2="880" y2="96" stroke="#C6A15B" stroke-width="1.2" opacity="0.7"/>
    <circle cx="880" cy="96" r="3" fill="#55100F"/>
    <line x1="1680" y1="96" x2="2000" y2="96" stroke="#C6A15B" stroke-width="1.2" opacity="0.7"/>
    <circle cx="1680" cy="96" r="3" fill="#55100F"/>

    <line x1="50" y1="142" x2="${W - 50}" y2="142" stroke="#C6A15B" stroke-width="0.9" opacity="0.5"/>

    <!-- LEFT ZONE: THE CENTRAL SHERWANI FIGURE -->
    <rect x="45" y="156" width="1540" height="1220" fill="none" stroke="#C6A15B" stroke-width="1.5" filter="url(#shadow)"/>

    <!-- Front and Back View Heading Badges -->
    <rect x="360" y="172" width="180" height="34" rx="4" fill="#55100F" filter="url(#badge-shadow)"/>
    <text x="450" y="194" class="view-label">01. FRONT VIEW</text>

    <rect x="1080" y="172" width="180" height="34" rx="4" fill="#55100F" filter="url(#badge-shadow)"/>
    <text x="1170" y="194" class="view-label">02. BACK VIEW</text>

    <!-- METROLOGY MARKERS: FRONT VIEW -->

    <!-- 07. NECK -->
    <ellipse cx="430" cy="385" rx="44" ry="14" fill="none" class="measure-line"/>
    <line x1="474" y1="385" x2="160" y2="340" class="measure-lead"/>
    <g transform="translate(60, 318)" filter="url(#shadow)">
      <rect width="190" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">07</text>
      <text x="38" y="23" class="tag-text">Neck Collar Base</text>
    </g>

    <!-- 02. CHEST (Fullest Point) -->
    <line x1="330" y1="510" x2="530" y2="510" class="measure-line"/>
    <circle cx="330" cy="510" r="4" fill="#C6A15B"/>
    <circle cx="530" cy="510" r="4" fill="#C6A15B"/>
    <line x1="330" y1="510" x2="160" y2="470" class="measure-lead"/>
    <g transform="translate(60, 448)" filter="url(#shadow)">
      <rect width="195" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">02</text>
      <text x="38" y="23" class="tag-text">Chest / Low Chest</text>
    </g>

    <!-- 05. SLEEVES -->
    <path d="M315,405 C305,530 295,660 310,775" fill="none" class="measure-line" stroke-width="2.5"/>
    <circle cx="315" cy="405" r="4" fill="#C6A15B"/>
    <circle cx="310" cy="775" r="4" fill="#C6A15B"/>
    <line x1="300" y1="590" x2="160" y2="590" class="measure-lead"/>
    <g transform="translate(60, 568)" filter="url(#shadow)">
      <rect width="190" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">05</text>
      <text x="38" y="23" class="tag-text">Sleeves (Tip to Wrist)</text>
    </g>

    <!-- 10. BICEP -->
    <ellipse cx="308" cy="520" rx="22" ry="8" fill="none" class="measure-line"/>
    <line x1="286" y1="520" x2="160" y2="690" class="measure-lead"/>
    <g transform="translate(60, 672)" filter="url(#shadow)">
      <rect width="185" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">10</text>
      <text x="38" y="23" class="tag-text">Bicep Circumference</text>
    </g>

    <!-- 03. WAIST (Stomach Level) -->
    <line x1="345" y1="680" x2="515" y2="680" class="measure-line"/>
    <circle cx="345" cy="680" r="4" fill="#C6A15B"/>
    <circle cx="515" cy="680" r="4" fill="#C6A15B"/>
    <line x1="345" y1="680" x2="160" y2="790" class="measure-lead"/>
    <g transform="translate(60, 772)" filter="url(#shadow)">
      <rect width="195" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">03</text>
      <text x="38" y="23" class="tag-text">Waist (Stomach Level)</text>
    </g>

    <!-- 01. SHERWANI LENGTH -->
    <line x1="430" y1="375" x2="430" y2="990" class="measure-line" stroke-width="2.5" stroke="#55100F"/>
    <circle cx="430" cy="375" r="5" fill="#55100F"/>
    <circle cx="430" cy="990" r="5" fill="#55100F"/>
    <line x1="430" y1="990" x2="160" y2="920" class="measure-lead"/>
    <g transform="translate(60, 902)" filter="url(#shadow)">
      <rect width="205" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">01</text>
      <text x="38" y="23" class="tag-text">Sherwani Length</text>
    </g>

    <!-- TROUSER 01. OUTSEAM (Trouser Waist to Heel) -->
    <line x1="535" y1="730" x2="535" y2="1280" class="measure-line" stroke-width="2.5"/>
    <circle cx="535" cy="730" r="4" fill="#C6A15B"/>
    <circle cx="535" cy="1280" r="4" fill="#C6A15B"/>
    <line x1="535" y1="1200" x2="160" y2="1050" class="measure-lead"/>
    <g transform="translate(60, 1032)" filter="url(#shadow)">
      <rect width="205" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">T1</text>
      <text x="38" y="23" class="tag-text">Trouser 01. Length</text>
    </g>

    <!-- TROUSER 05. KNEE & 06. BOTTOM -->
    <line x1="390" y1="1100" x2="160" y2="1160" class="measure-lead"/>
    <g transform="translate(60, 1142)" filter="url(#shadow)">
      <rect width="185" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">T5</text>
      <text x="38" y="23" class="tag-text">Trouser 05. Knee</text>
    </g>

    <line x1="410" y1="1260" x2="160" y2="1260" class="measure-lead"/>
    <g transform="translate(60, 1242)" filter="url(#shadow)">
      <rect width="185" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">T6</text>
      <text x="38" y="23" class="tag-text">Trouser 06. Bottom</text>
    </g>


    <!-- METROLOGY MARKERS: BACK VIEW -->

    <!-- 06. SHOULDER WIDTH -->
    <line x1="1040" y1="400" x2="1280" y2="400" class="measure-line" stroke-width="2.5"/>
    <circle cx="1040" cy="400" r="4" fill="#C6A15B"/>
    <circle cx="1280" cy="400" r="4" fill="#C6A15B"/>
    <line x1="1280" y1="400" x2="1420" y2="350" class="measure-lead"/>
    <g transform="translate(1330, 328)" filter="url(#shadow)">
      <rect width="210" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">06</text>
      <text x="38" y="23" class="tag-text">Shoulder (Tip to Tip)</text>
    </g>

    <!-- 08. CROSS BACK -->
    <line x1="1075" y1="520" x2="1245" y2="520" class="measure-line"/>
    <circle cx="1075" cy="520" r="4" fill="#C6A15B"/>
    <circle cx="1245" cy="520" r="4" fill="#C6A15B"/>
    <line x1="1245" y1="520" x2="1420" y2="490" class="measure-lead"/>
    <g transform="translate(1330, 468)" filter="url(#shadow)">
      <rect width="190" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">08</text>
      <text x="38" y="23" class="tag-text">Cross Back (Blades)</text>
    </g>

    <!-- 04. HIP (Seat) -->
    <line x1="1070" y1="810" x2="1250" y2="810" class="measure-line"/>
    <circle cx="1070" cy="810" r="4" fill="#C6A15B"/>
    <circle cx="1250" cy="810" r="4" fill="#C6A15B"/>
    <line x1="1250" y1="810" x2="1420" y2="620" class="measure-lead"/>
    <g transform="translate(1330, 600)" filter="url(#shadow)">
      <rect width="180" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">04</text>
      <text x="38" y="23" class="tag-text">Hip (Fullest Seat)</text>
    </g>

    <!-- TROUSER 02. WAISTBAND -->
    <line x1="1085" y1="730" x2="1235" y2="730" class="measure-line"/>
    <line x1="1235" y1="730" x2="1420" y2="750" class="measure-lead"/>
    <g transform="translate(1330, 730)" filter="url(#shadow)">
      <rect width="190" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">T2</text>
      <text x="38" y="23" class="tag-text">Trouser 02. Waist</text>
    </g>

    <!-- TROUSER 04. THIGH -->
    <ellipse cx="1120" cy="980" rx="26" ry="10" fill="none" class="measure-line"/>
    <line x1="1146" y1="980" x2="1420" y2="890" class="measure-lead"/>
    <g transform="translate(1330, 870)" filter="url(#shadow)">
      <rect width="180" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">T4</text>
      <text x="38" y="23" class="tag-text">Trouser 04. Thigh</text>
    </g>

    <!-- TROUSER 07. CROTCH / RISE -->
    <line x1="1150" y1="890" x2="1140" y2="1280" class="measure-line" stroke-width="2"/>
    <circle cx="1150" cy="890" r="4" fill="#C6A15B"/>
    <circle cx="1140" cy="1280" r="4" fill="#C6A15B"/>
    <line x1="1145" y1="1080" x2="1420" y2="1040" class="measure-lead"/>
    <g transform="translate(1330, 1020)" filter="url(#shadow)">
      <rect width="190" height="36" class="tag-bg"/>
      <circle cx="18" cy="18" r="12" class="badge-circle"/>
      <text x="18" y="18" class="badge-num">T7</text>
      <text x="38" y="23" class="tag-text">Trouser 07. Crotch</text>
    </g>


    <!-- RIGHT ZONE: TAPE MEASUREMENT DEMONSTRATION PANELS -->
    <rect x="1605" y="156" width="905" height="1220" fill="#FBF8F2" stroke="#C6A15B" stroke-width="1.2" rx="4" filter="url(#shadow)"/>
    <rect x="1612" y="163" width="891" height="1206" fill="none" stroke="#C6A15B" stroke-width="0.6" opacity="0.6"/>

    <text x="1635" y="196" class="panel-head">HOW TO MEASURE FOR SHERWANI</text>
    <text x="1635" y="216" class="panel-sub">PHOTOGRAPHIC DEMONSTRATIONS • CLIENT REFERENCE SPECIFICATION</text>
    <line x1="1635" y1="228" x2="2480" y2="228" stroke="#C6A15B" stroke-width="1" opacity="0.5"/>

    <!-- Demo Card 1: 07. NECK (Y: 242) -->
    <rect x="1630" y="242" width="855" height="175" rx="3" fill="#FFFFFF" stroke="#E5DED0" filter="url(#shadow)"/>
    <rect x="1630" y="242" width="324" height="175" fill="none" stroke="#C6A15B" stroke-width="0.8"/>
    <g transform="translate(1975, 275)">
      <circle cx="14" cy="14" r="14" class="badge-circle"/>
      <text x="14" y="14" class="badge-num">07</text>
      <text x="38" y="12" class="card-title">07. NECK COLLAR BASE</text>
      <text x="38" y="32" class="card-step">Tape around base of neck where the Sherwani collar bands.</text>
      <text x="38" y="58" class="card-desc">&#8226; Rest tape comfortably at Adam's apple level.</text>
      <text x="38" y="80" class="card-desc">&#8226; Keep one finger under tape for ease of breathing &amp; royal drape.</text>
      <text x="38" y="102" class="card-desc">&#8226; Critical for impeccable stand collar comfort without choke.</text>
    </g>

    <!-- Demo Card 2: 02. CHEST (Y: 428) -->
    <rect x="1630" y="428" width="855" height="175" rx="3" fill="#FFFFFF" stroke="#E5DED0" filter="url(#shadow)"/>
    <rect x="1630" y="428" width="324" height="175" fill="none" stroke="#C6A15B" stroke-width="0.8"/>
    <g transform="translate(1975, 460)">
      <circle cx="14" cy="14" r="14" class="badge-circle"/>
      <text x="14" y="14" class="badge-num">02</text>
      <text x="38" y="12" class="card-title">02. CHEST / LOW CHEST</text>
      <text x="38" y="32" class="card-step">Wrap tape horizontally around fullest point of chest.</text>
      <text x="38" y="58" class="card-desc">&#8226; Keep tape horizontal under armpits and across shoulder blades.</text>
      <text x="38" y="80" class="card-desc">&#8226; Stand naturally with arms relaxed at sides; breathe normally.</text>
      <text x="38" y="102" class="card-desc">&#8226; Establishes master chest ease and zero pulling across chest.</text>
    </g>

    <!-- Demo Card 3: 06. SHOULDER (Y: 614) -->
    <rect x="1630" y="614" width="855" height="175" rx="3" fill="#FFFFFF" stroke="#E5DED0" filter="url(#shadow)"/>
    <rect x="1630" y="614" width="324" height="175" fill="none" stroke="#C6A15B" stroke-width="0.8"/>
    <g transform="translate(1975, 646)">
      <circle cx="14" cy="14" r="14" class="badge-circle"/>
      <text x="14" y="14" class="badge-num">06</text>
      <text x="38" y="12" class="card-title">06. SHOULDER (TIP TO TIP)</text>
      <text x="38" y="32" class="card-step">Measure from outer left shoulder bone to right shoulder bone.</text>
      <text x="38" y="58" class="card-desc">&#8226; Follow the natural contour across the upper back curve.</text>
      <text x="38" y="80" class="card-desc">&#8226; Wear a fitted shirt during measure for highest accuracy.</text>
      <text x="38" y="102" class="card-desc">&#8226; Defines royal Aligarh pad placement and armhole pitch.</text>
    </g>

    <!-- Demo Card 4: 05. SLEEVES (Y: 800) -->
    <rect x="1630" y="800" width="855" height="175" rx="3" fill="#FFFFFF" stroke="#E5DED0" filter="url(#shadow)"/>
    <rect x="1630" y="800" width="324" height="175" fill="none" stroke="#C6A15B" stroke-width="0.8"/>
    <g transform="translate(1975, 832)">
      <circle cx="14" cy="14" r="14" class="badge-circle"/>
      <text x="14" y="14" class="badge-num">05</text>
      <text x="38" y="12" class="card-title">05. SLEEVES (SHOULDER TO WRIST)</text>
      <text x="38" y="32" class="card-step">From the shoulder tip bone down arm to wrist bone.</text>
      <text x="38" y="58" class="card-desc">&#8226; Keep arm naturally hanging with slight relaxed bend.</text>
      <text x="38" y="80" class="card-desc">&#8226; Sherwani sleeves rest just at wrist bone, displaying 0.5" kurta cuff.</text>
      <text x="38" y="102" class="card-desc">&#8226; Ensures embroidered cuffs fall gracefully over hands.</text>
    </g>

    <!-- Demo Card 5: 10. BICEP (Y: 985) -->
    <rect x="1630" y="985" width="855" height="175" rx="3" fill="#FFFFFF" stroke="#E5DED0" filter="url(#shadow)"/>
    <rect x="1630" y="985" width="324" height="175" fill="none" stroke="#C6A15B" stroke-width="0.8"/>
    <g transform="translate(1975, 1017)">
      <circle cx="14" cy="14" r="14" class="badge-circle"/>
      <text x="14" y="14" class="badge-num">10</text>
      <text x="38" y="12" class="card-title">10. BICEP CIRCUMFERENCE</text>
      <text x="38" y="32" class="card-step">Measure around the fullest part of upper arm.</text>
      <text x="38" y="58" class="card-desc">&#8226; Keep arm relaxed at side; do not flex or squeeze tape tight.</text>
      <text x="38" y="80" class="card-desc">&#8226; Guarantees ease of arm movement and tailored upper silhouette.</text>
      <text x="38" y="102" class="card-desc">&#8226; Prevents sleeve tightness during ceremonial greetings.</text>
    </g>

    <!-- Demo Card 6: 01. LENGTH & 03. WAIST (Y: 1170) -->
    <rect x="1630" y="1170" width="855" height="185" rx="3" fill="#FFFFFF" stroke="#E5DED0" filter="url(#shadow)"/>
    <rect x="1630" y="1170" width="324" height="185" fill="none" stroke="#C6A15B" stroke-width="0.8"/>
    <g transform="translate(1975, 1200)">
      <circle cx="14" cy="14" r="14" class="badge-circle"/>
      <text x="14" y="14" class="badge-num">01</text>
      <text x="38" y="12" class="card-title">01. SHERWANI LENGTH &amp; 03. WAIST</text>
      <text x="38" y="32" class="card-step">Front nape to hem length &amp; stomach circumference.</text>
      <text x="38" y="58" class="card-desc">&#8226; <strong>Length:</strong> Standard below-knee cut for Aligarh royal silhouette.</text>
      <text x="38" y="80" class="card-desc">&#8226; <strong>Waist:</strong> Measured at navel level where front buttons close.</text>
      <text x="38" y="102" class="card-desc">&#8226; Outseam length for churidar pajamas includes traditional gather ease.</text>
    </g>


    <!-- FOOTER TRUST AND ATELIER IDENTITY BAR -->
    <line x1="45" y1="1410" x2="${W - 45}" y2="1410" stroke="#C6A15B" stroke-width="1.2"/>

    <!-- Key Measurement Legend Badges -->
    <g transform="translate(55, 1435)">
      <text x="0" y="14" class="footer-txt"><tspan class="footer-gold">LIBAS TAILOR &#8226; ALIGARH</tspan> &#8226; Bespoke Menswear Atelier &#8226; Shamshad Market, Opposite Sulaiman Hall, AMU Aligarh</text>
      <text x="0" y="36" class="footer-txt">Direct Tailor WhatsApp: <tspan class="footer-gold">+91 90276 72285</tspan> &#8226; Website: <tspan class="footer-gold">libastailor.in</tspan> &#8226; Standard Metrology: <tspan class="footer-gold">ALL MEASUREMENTS IN INCHES</tspan></text>
    </g>

    <g transform="translate(2020, 1435)">
      <rect x="0" y="-4" width="480" height="48" rx="3" fill="#FAF7F0" stroke="#C6A15B" stroke-width="1"/>
      <text x="18" y="18" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="700" fill="#55100F">OFFICIAL CLIENT MEASUREMENT SPECIFICATION</text>
      <text x="18" y="34" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" fill="#6B6259">Sherwani 01-11 • Trouser 01-07 • Shirt measurements in inches.</text>
    </g>

  </svg>
  `;

  // Base luxury canvas (Warm Ivory #FAF7F0)
  const baseCanvas = await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: { r: 250, g: 247, b: 240, alpha: 1.0 }
    }
  }).png().toBuffer();

  // Composite all elements together
  const compositeList = [
    // 1. Center Sherwani model (X: 45, Y: 156)
    { input: modelResized, left: 45, top: 156 },

    // 2. SVG overlay with all labels, numbers, borders, lines, and card containers
    { input: Buffer.from(svgOverlay), left: 0, top: 0 },

    // 3. Demo panel 1: Neck (X: 1632, Y: 244)
    { input: cropNeck, left: 1632, top: 244 },

    // 4. Demo panel 2: Chest (X: 1632, Y: 430)
    { input: cropChest, left: 1632, top: 430 },

    // 5. Demo panel 3: Shoulder (X: 1632, Y: 616)
    { input: cropShoulder, left: 1632, top: 616 },

    // 6. Demo panel 4: Sleeve (X: 1632, Y: 802)
    { input: cropSleeve, left: 1632, top: 802 },

    // 7. Demo panel 5: Bicep (X: 1632, Y: 987)
    { input: cropBicep, left: 1632, top: 987 },

    // 8. Demo panel 6: Waist (X: 1632, Y: 1172)
    { input: cropWaist, left: 1632, top: 1172 },

    // 9. Logo at top left
    { input: logoResized, left: 70, top: 56 },

    // 10. Logo at top right for balanced symmetry
    { input: logoResized, left: W - 70 - logoW, top: 56 }
  ];

  const finalWebp = await sharp(baseCanvas)
    .composite(compositeList)
    .webp({ quality: 92, effort: 6 })
    .toFile(OUTPUT_PATH);

  console.log('Successfully saved Libas Tailor Measurement Guide to:', OUTPUT_PATH);
  console.log('Final WebP info:', finalWebp);
}

buildGuide().catch(err => {
  console.error('Error generating guide:', err);
  process.exit(1);
});
