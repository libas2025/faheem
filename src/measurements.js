// LIBAS TAILOR — Bespoke Measurement Engine & PDF Generation System
// Converted from Master Tailor Physical Measurement Sheet (Inches Metrology)
import { jsPDF } from 'jspdf';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('measurements-form');
  if (!form) return;

  let generatedPdfDoc = null;
  let lastSubmittedData = null;

  // 1. Validation Helper
  function validateField(input) {
    const errorEl = document.getElementById(`${input.id}-error`);
    let isValid = true;
    let errorMsg = '';

    if (input.required && !input.value.trim()) {
      isValid = false;
      errorMsg = 'This field is required.';
    } else if (input.type === 'email' && input.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value.trim())) {
        isValid = false;
        errorMsg = 'Please enter a valid email address.';
      }
    } else if (input.type === 'tel' && input.value.trim()) {
      const phoneRegex = /^[0-9+\s-]{8,15}$/;
      if (!phoneRegex.test(input.value.trim())) {
        isValid = false;
        errorMsg = 'Please enter a valid telephone number.';
      }
    } else if (input.classList.contains('num-measure') && input.value.trim()) {
      const num = parseFloat(input.value.trim());
      if (isNaN(num) || num <= 0) {
        isValid = false;
        errorMsg = 'Please enter a valid number (e.g. 38.5).';
      }
    }

    if (!isValid) {
      input.classList.add('field-error-border');
      if (errorEl) {
        errorEl.textContent = errorMsg;
        errorEl.style.display = 'block';
      }
    } else {
      input.classList.remove('field-error-border');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
    }

    return isValid;
  }

  // Live validation on blur & input
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('field-error-border')) {
        validateField(input);
      }
    });
  });

  // Dynamic Garment Type Focus Assist (Smoothly navigates/highlights sections without hiding)
  const garmentSelect = document.getElementById('garment-type');
  if (garmentSelect) {
    garmentSelect.addEventListener('change', () => {
      const val = garmentSelect.value;
      const secSherwani = document.getElementById('sec-sherwani-measurements');
      const secTrouser = document.getElementById('sec-trouser-measurements');
      const secShirt = document.getElementById('sec-shirt-measurements');

      [secSherwani, secTrouser, secShirt].forEach(el => {
        if (el) el.style.opacity = '1';
      });

      if (val === 'Shirt Only') {
        if (secShirt) secShirt.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (val === 'Trouser Only') {
        if (secTrouser) secTrouser.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (val === 'Sherwani' || val === 'Sherwani Only' || val === 'Suit') {
        if (secSherwani) secSherwani.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Helper for rendering luxury border box on PDF page
  function drawPageFrame(doc, pageWidth, pageHeight) {
    // Outer Antique Gold Border
    doc.setDrawColor(198, 161, 91);
    doc.setLineWidth(0.8);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    // Inner Subtle Border
    doc.setDrawColor(198, 161, 91);
    doc.setLineWidth(0.2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  }

  // 2. Generate High-End Branded PDF Document (2 Pages, Client Physical Sheet Sequence)
  function generateBespokePDF(data) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ================= PAGE 1 =================
    // Background Warm Ivory
    doc.setFillColor(250, 247, 240);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    drawPageFrame(doc, pageWidth, pageHeight);

    // Page 1 Header: LIBAS TAILOR / Aligarh
    doc.setTextColor(85, 16, 15); // Royal Burgundy
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text('LIBAS TAILOR', pageWidth / 2, 20, { align: 'center' });

    doc.setTextColor(198, 161, 91); // Antique Gold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('ALIGARH', pageWidth / 2, 25, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 85, 75);
    doc.text('Bespoke Menswear Atelier • Shamshad Market, Opposite Sulaiman Hall, AMU Aligarh', pageWidth / 2, 29.5, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(85, 16, 15);
    doc.text('Bespoke Tailoring Measurement Profile — Sherwani & Ensembles', pageWidth / 2, 34.5, { align: 'center' });

    // Fine Gold Rule
    doc.setDrawColor(198, 161, 91);
    doc.setLineWidth(0.5);
    doc.line(16, 37, pageWidth - 16, 37);

    // --- 1. CUSTOMER INFORMATION ---
    let y = 43;
    doc.setFillColor(242, 235, 221); // Soft Cream
    doc.rect(16, y, pageWidth - 32, 21, 'F');
    doc.setDrawColor(198, 161, 91);
    doc.rect(16, y, pageWidth - 32, 21, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(85, 16, 15);
    doc.text('CUSTOMER INFORMATION', 20, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(36, 33, 30);
    doc.text(`Name: ${data.name}`, 20, y + 10.5);
    doc.text(`Phone: ${data.phone}`, 20, y + 15.5);
    doc.text(`Email: ${data.email || '—'}`, 85, y + 10.5);
    doc.text(`Order Ref: ${data.orderRef || 'LIB-ATELIER'}`, 85, y + 15.5);
    doc.text(`Garment: ${data.garment}`, 145, y + 10.5);
    doc.text(`Date: ${data.date} (Inches)`, 145, y + 15.5);

    // --- 2. BODY POSTURE ---
    y = 70;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(85, 16, 15);
    doc.text('BODY POSTURE', 16, y);
    doc.setLineWidth(0.3);
    doc.line(16, y + 1.5, pageWidth - 16, y + 1.5);

    y += 6.5;
    const postureFields = [
      ['Back Shape', data.postureBack],
      ['Stomach', data.postureStomach],
      ['Shoulder Type', data.postureShoulder]
    ];

    postureFields.forEach((item, idx) => {
      const posX = 16 + idx * 59;
      doc.setFillColor(255, 255, 255);
      doc.rect(posX, y, 57, 8, 'F');
      doc.setDrawColor(215, 205, 190);
      doc.rect(posX, y, 57, 8, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(110, 95, 80);
      doc.text(`${item[0]}:`, posX + 3, y + 5.2);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(36, 33, 30);
      doc.text(String(item[1] || 'Normal'), posX + 54, y + 5.2, { align: 'right' });
    });

    // --- 3. SHERWANI MEASUREMENTS (01 to 11 in exact client order) ---
    y = 92;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(85, 16, 15);
    doc.text('SHERWANI MEASUREMENTS (INCHES)', 16, y);
    doc.setLineWidth(0.3);
    doc.line(16, y + 1.5, pageWidth - 16, y + 1.5);

    y += 6.5;
    const sherwaniFields = [
      ['01. Length', data.sherwaniLength],
      ['02. Chest / Low Chest', data.sherwaniChest],
      ['03. Waist', data.sherwaniWaist],
      ['04. Hip', data.sherwaniHip],
      ['05. Sleeves', data.sherwaniSleeves],
      ['06. Shoulder', data.sherwaniShoulder],
      ['07. Neck', data.sherwaniNeck],
      ['08. Cross Back', data.sherwaniCrossBack],
      ['09. Cross Front', data.sherwaniCrossFront],
      ['10. Bicep', data.sherwaniBicep],
      ['11. Arm Hole Round', data.sherwaniArmHole]
    ];

    sherwaniFields.forEach((item, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const posX = 16 + col * 59.5;
      const posY = y + row * 9.5;

      doc.setFillColor(255, 255, 255);
      doc.rect(posX, posY, 57.5, 7.5, 'F');
      doc.setDrawColor(215, 205, 190);
      doc.rect(posX, posY, 57.5, 7.5, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(110, 95, 80);
      doc.text(`${item[0]}:`, posX + 2.5, posY + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(36, 33, 30);
      const valStr = item[1] ? `${item[1]}"` : '—';
      doc.text(valStr, posX + 55, posY + 5, { align: 'right' });
    });

    // --- 4. SHERWANI STYLE DETAILS ---
    y = 143;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(85, 16, 15);
    doc.text('SHERWANI STYLE DETAILS', 16, y);
    doc.setLineWidth(0.3);
    doc.line(16, y + 1.5, pageWidth - 16, y + 1.5);

    y += 6.5;
    const sherwaniStyleFields = [
      ['Style', data.sherwaniStyle],
      ['Lapel', data.sherwaniLapel],
      ['Vent', data.sherwaniVent],
      ['Pocket', data.sherwaniPocket],
      ['Fit', data.sherwaniFit],
      ['Sleeve Placket', data.sherwaniSleevePlacket]
    ];

    sherwaniStyleFields.forEach((item, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const posX = 16 + col * 59.5;
      const posY = y + row * 9.5;

      doc.setFillColor(255, 255, 255);
      doc.rect(posX, posY, 57.5, 7.5, 'F');
      doc.setDrawColor(215, 205, 190);
      doc.rect(posX, posY, 57.5, 7.5, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(110, 95, 80);
      doc.text(`${item[0]}:`, posX + 2.5, posY + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(36, 33, 30);
      doc.text(String(item[1] || '—'), posX + 55, posY + 5, { align: 'right' });
    });

    y += 22;
    doc.setFillColor(255, 255, 255);
    doc.rect(16, y, pageWidth - 32, 14, 'F');
    doc.setDrawColor(215, 205, 190);
    doc.rect(16, y, pageWidth - 32, 14, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(85, 16, 15);
    doc.text(`Others / Code: ${data.sherwaniCode || 'None'}`, 20, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 60, 50);
    doc.text(`Remarks: ${data.sherwaniRemarks || 'Standard atelier cut and hand finishing.'}`, 20, y + 10);

    // Page 1 Footer
    const p1FooterY = pageHeight - 16;
    doc.setDrawColor(198, 161, 91);
    doc.setLineWidth(0.3);
    doc.line(16, p1FooterY, pageWidth - 16, p1FooterY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(110, 100, 90);
    doc.text('LIBAS TAILOR, Aligarh • Page 1 of 2 • Continued with Trouser & Shirt Specifications on Page 2', pageWidth / 2, p1FooterY + 4.5, { align: 'center' });

    // ================= PAGE 2 =================
    doc.addPage();
    doc.setFillColor(250, 247, 240);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    drawPageFrame(doc, pageWidth, pageHeight);

    // Page 2 Header
    doc.setTextColor(85, 16, 15);
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.text('LIBAS TAILOR', pageWidth / 2, 20, { align: 'center' });

    doc.setTextColor(198, 161, 91);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('ALIGARH', pageWidth / 2, 24.5, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(90, 80, 70);
    doc.text(`Trouser & Shirt Measurements • Client: ${data.name}`, pageWidth / 2, 29, { align: 'center' });

    doc.setDrawColor(198, 161, 91);
    doc.setLineWidth(0.4);
    doc.line(16, 32, pageWidth - 16, 32);

    // --- 5. TROUSER MEASUREMENTS (01 to 07 in exact client order) ---
    y = 39;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(85, 16, 15);
    doc.text('TROUSER MEASUREMENTS (INCHES)', 16, y);
    doc.setLineWidth(0.3);
    doc.line(16, y + 1.5, pageWidth - 16, y + 1.5);

    y += 6.5;
    const trouserFields = [
      ['01. Length', data.trouserLength],
      ['02. Waist', data.trouserWaist],
      ['03. Hip', data.trouserHip],
      ['04. Thigh', data.trouserThigh],
      ['05. Knee', data.trouserKnee],
      ['06. Bottom', data.trouserBottom],
      ['07. Crotch', data.trouserCrotch]
    ];

    trouserFields.forEach((item, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const posX = 16 + col * 59.5;
      const posY = y + row * 9.5;

      doc.setFillColor(255, 255, 255);
      doc.rect(posX, posY, 57.5, 7.5, 'F');
      doc.setDrawColor(215, 205, 190);
      doc.rect(posX, posY, 57.5, 7.5, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(110, 95, 80);
      doc.text(`${item[0]}:`, posX + 2.5, posY + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(36, 33, 30);
      const valStr = item[1] ? `${item[1]}"` : '—';
      doc.text(valStr, posX + 55, posY + 5, { align: 'right' });
    });

    // --- 6. TROUSER STYLE DETAILS ---
    y = 78;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(85, 16, 15);
    doc.text('TROUSER STYLE DETAILS', 16, y);
    doc.setLineWidth(0.3);
    doc.line(16, y + 1.5, pageWidth - 16, y + 1.5);

    y += 6.5;
    const trouserStyleFields = [
      ['Belt Style', data.trouserBelt],
      ['Pleat', data.trouserPleat],
      ['Pocket', data.trouserPocket],
      ['Back Pocket', data.trouserBackPocket],
      ['Bottom', data.trouserBottomStyle],
      ['Loops', data.trouserLoops],
      ['Fit', data.trouserFit],
      ['Size', data.trouserSize || 'Standard']
    ];

    trouserStyleFields.forEach((item, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const posX = 16 + col * 44.5;
      const posY = y + row * 9.5;

      doc.setFillColor(255, 255, 255);
      doc.rect(posX, posY, 42.5, 7.5, 'F');
      doc.setDrawColor(215, 205, 190);
      doc.rect(posX, posY, 42.5, 7.5, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(110, 95, 80);
      doc.text(`${item[0]}:`, posX + 2, posY + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(36, 33, 30);
      doc.text(String(item[1] || '—'), posX + 40.5, posY + 5, { align: 'right' });
    });

    y += 22;
    doc.setFillColor(255, 255, 255);
    doc.rect(16, y, pageWidth - 32, 8, 'F');
    doc.setDrawColor(215, 205, 190);
    doc.rect(16, y, pageWidth - 32, 8, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(70, 60, 50);
    doc.text(`Trouser Remarks: ${data.trouserRemarks || 'Standard tailored bottom finishing.'}`, 20, y + 5.2);

    // --- 7. SHIRT MEASUREMENTS (Unnumbered sequence as on sheet) ---
    y = 122;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(85, 16, 15);
    doc.text('SHIRT MEASUREMENTS (INCHES)', 16, y);
    doc.setLineWidth(0.3);
    doc.line(16, y + 1.5, pageWidth - 16, y + 1.5);

    y += 6.5;
    const shirtFields = [
      ['Length', data.shirtLength],
      ['Chest', data.shirtChest],
      ['Low Chest', data.shirtLowChest],
      ['Waist', data.shirtWaist],
      ['Hip', data.shirtHip],
      ['Sleeves', data.shirtSleeves],
      ['Shoulder', data.shirtShoulder],
      ['Arm Round', data.shirtArmRound],
      ['Neck', data.shirtNeck],
      ['Cuff', data.shirtCuff],
      ['Biceps', data.shirtBiceps]
    ];

    shirtFields.forEach((item, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const posX = 16 + col * 59.5;
      const posY = y + row * 9.5;

      doc.setFillColor(255, 255, 255);
      doc.rect(posX, posY, 57.5, 7.5, 'F');
      doc.setDrawColor(215, 205, 190);
      doc.rect(posX, posY, 57.5, 7.5, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(110, 95, 80);
      doc.text(`${item[0]}:`, posX + 2.5, posY + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(36, 33, 30);
      const valStr = item[1] ? `${item[1]}"` : '—';
      doc.text(valStr, posX + 55, posY + 5, { align: 'right' });
    });

    // --- 8. REMARKS & SPECIAL INSTRUCTIONS ---
    y = 175;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(85, 16, 15);
    doc.text('SPECIAL INSTRUCTIONS & ATELIER REMARKS', 16, y);
    doc.setLineWidth(0.3);
    doc.line(16, y + 1.5, pageWidth - 16, y + 1.5);

    y += 6;
    doc.setFillColor(255, 255, 255);
    doc.rect(16, y, pageWidth - 32, 28, 'F');
    doc.setDrawColor(215, 205, 190);
    doc.rect(16, y, pageWidth - 32, 28, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 50, 40);
    const splitNotes = doc.splitTextToSize(
      data.specialNotes || 'None specified. Individual paper pattern will be drafted per anatomical metrology and stance notes.',
      pageWidth - 40
    );
    doc.text(splitNotes, 20, y + 6);

    // Page 2 Footer
    const p2FooterY = pageHeight - 20;
    doc.setDrawColor(198, 161, 91);
    doc.setLineWidth(0.4);
    doc.line(16, p2FooterY, pageWidth - 16, p2FooterY);

    doc.setFont('times', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 100, 90);
    doc.text(
      'Official Bespoke Profile • LIBAS TAILOR, Shamshad Market, Opposite Sulaiman Hall, AMU Aligarh, UP 202001',
      pageWidth / 2,
      p2FooterY + 4.5,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(85, 16, 15);
    doc.text(
      'LIBAS TAILOR • Master WhatsApp: +91 90276 72285 • info@libastailor.in • libastailor.in',
      pageWidth / 2,
      p2FooterY + 8.5,
      { align: 'center' }
    );

    return doc;
  }

  // 3. Form Submission Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let formValid = true;
    form.querySelectorAll('input[required]').forEach(input => {
      if (!validateField(input)) {
        formValid = false;
      }
    });

    if (!formValid) {
      const firstError = form.querySelector('.field-error-border');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    const submitBtn = document.getElementById('btn-submit-measurements');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'GENERATING BESPOKE PDF & REGISTERING...';
    }

    // Collect all data points matching the client's physical sheet
    const formData = {
      // 1. Customer
      name: document.getElementById('client-name')?.value.trim() || '',
      phone: document.getElementById('client-phone')?.value.trim() || '',
      email: document.getElementById('client-email')?.value.trim() || '',
      orderRef: document.getElementById('client-order-ref')?.value.trim() || '',
      garment: document.getElementById('garment-type')?.value || 'Sherwani',
      contactMethod: document.getElementById('client-contact-method')?.value || 'WhatsApp',
      address: document.getElementById('client-address')?.value.trim() || '',
      unit: 'inches',
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      timestamp: new Date().toISOString(),

      // 2. Body Posture
      postureBack: document.querySelector('input[name="posture_back_shape"]:checked')?.value || 'Normal',
      postureStomach: document.querySelector('input[name="posture_stomach"]:checked')?.value || 'Normal',
      postureShoulder: document.querySelector('input[name="posture_shoulder_type"]:checked')?.value || 'Regular',

      // 3. Sherwani Measurements 01 to 11
      sherwaniLength: document.getElementById('sherwani-length')?.value || '',
      sherwaniChest: document.getElementById('sherwani-chest')?.value || '',
      sherwaniWaist: document.getElementById('sherwani-waist')?.value || '',
      sherwaniHip: document.getElementById('sherwani-hip')?.value || '',
      sherwaniSleeves: document.getElementById('sherwani-sleeves')?.value || '',
      sherwaniShoulder: document.getElementById('sherwani-shoulder')?.value || '',
      sherwaniNeck: document.getElementById('sherwani-neck')?.value || '',
      sherwaniCrossBack: document.getElementById('sherwani-cross-back')?.value || '',
      sherwaniCrossFront: document.getElementById('sherwani-cross-front')?.value || '',
      sherwaniBicep: document.getElementById('sherwani-bicep')?.value || '',
      sherwaniArmHole: document.getElementById('sherwani-arm-hole')?.value || '',

      // 4. Sherwani Style Details
      sherwaniStyle: document.querySelector('input[name="sherwani_style"]:checked')?.value || 'SB',
      sherwaniLapel: document.querySelector('input[name="sherwani_lapel"]:checked')?.value || 'Mandarin Collar',
      sherwaniVent: document.querySelector('input[name="sherwani_vent"]:checked')?.value || 'Side Vent',
      sherwaniPocket: document.querySelector('input[name="sherwani_pocket"]:checked')?.value || 'Slant',
      sherwaniFit: document.querySelector('input[name="sherwani_fit"]:checked')?.value || 'Regular Fit',
      sherwaniSleevePlacket: document.querySelector('input[name="sherwani_sleeve_placket"]:checked')?.value || 'Vent',
      sherwaniCode: document.getElementById('sherwani-code')?.value.trim() || '',
      sherwaniRemarks: document.getElementById('sherwani-remarks')?.value.trim() || '',

      // 5. Trouser Measurements 01 to 07
      trouserLength: document.getElementById('trouser-length')?.value || '',
      trouserWaist: document.getElementById('trouser-waist')?.value || '',
      trouserHip: document.getElementById('trouser-hip')?.value || '',
      trouserThigh: document.getElementById('trouser-thigh')?.value || '',
      trouserKnee: document.getElementById('trouser-knee')?.value || '',
      trouserBottom: document.getElementById('trouser-bottom')?.value || '',
      trouserCrotch: document.getElementById('trouser-crotch')?.value || '',

      // 6. Trouser Style Details
      trouserBelt: document.querySelector('input[name="trouser_belt"]:checked')?.value || 'Standard Belt',
      trouserPleat: document.querySelector('input[name="trouser_pleat"]:checked')?.value || 'Flat Front',
      trouserPocket: document.querySelector('input[name="trouser_pocket"]:checked')?.value || 'Cross Pocket',
      trouserBackPocket: document.querySelector('input[name="trouser_back_pocket"]:checked')?.value || 'Single Pocket',
      trouserBottomStyle: document.querySelector('input[name="trouser_bottom_style"]:checked')?.value || 'Plain Bottom',
      trouserLoops: document.querySelector('input[name="trouser_loops"]:checked')?.value || 'With Loops',
      trouserFit: document.querySelector('input[name="trouser_fit"]:checked')?.value || 'Regular Fit',
      trouserSize: document.getElementById('trouser-size')?.value.trim() || '',
      trouserRemarks: document.getElementById('trouser-remarks')?.value.trim() || '',

      // 7. Shirt Measurements
      shirtLength: document.getElementById('shirt-length')?.value || '',
      shirtChest: document.getElementById('shirt-chest')?.value || '',
      shirtLowChest: document.getElementById('shirt-low-chest')?.value || '',
      shirtWaist: document.getElementById('shirt-waist')?.value || '',
      shirtHip: document.getElementById('shirt-hip')?.value || '',
      shirtSleeves: document.getElementById('shirt-sleeves')?.value || '',
      shirtShoulder: document.getElementById('shirt-shoulder')?.value || '',
      shirtArmRound: document.getElementById('shirt-arm-round')?.value || '',
      shirtNeck: document.getElementById('shirt-neck')?.value || '',
      shirtCuff: document.getElementById('shirt-cuff')?.value || '',
      shirtBiceps: document.getElementById('shirt-biceps')?.value || '',

      // 8. Special Notes
      specialNotes: document.getElementById('client-special-notes')?.value.trim() || ''
    };

    lastSubmittedData = formData;

    try {
      // 1. Generate and auto-download Bespoke PDF
      generatedPdfDoc = generateBespokePDF(formData);
      const safeName = formData.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Client';
      const pdfFilename = `LIBAS_Sherwani_Bespoke_Measurement_${safeName}.pdf`;
      generatedPdfDoc.save(pdfFilename);

      // 2. Dispatch via Web3Forms (Key: 7097fd8c-680d-4e0a-86d8-0d53621e4b47)
      try {
        const web3FormData = new FormData();
        web3FormData.append("access_key", "7097fd8c-680d-4e0a-86d8-0d53621e4b47");
        web3FormData.append("subject", `New LIBAS Tailor Measurement Profile — ${formData.name} (${formData.garment})`);
        web3FormData.append("from_name", "LIBAS TAILOR Measurement Engine");
        web3FormData.append("name", formData.name);
        web3FormData.append("phone", formData.phone);
        web3FormData.append("email", formData.email);
        web3FormData.append("order_reference", formData.orderRef);
        web3FormData.append("garment_type", formData.garment);
        web3FormData.append("posture", `Back: ${formData.postureBack}, Stomach: ${formData.postureStomach}, Shoulder: ${formData.postureShoulder}`);
        web3FormData.append("sherwani_measurements", 
          `01 Length: ${formData.sherwaniLength}", 02 Chest: ${formData.sherwaniChest}", 03 Waist: ${formData.sherwaniWaist}", 04 Hip: ${formData.sherwaniHip}", 05 Sleeves: ${formData.sherwaniSleeves}", 06 Shoulder: ${formData.sherwaniShoulder}", 07 Neck: ${formData.sherwaniNeck}", 08 CrossBack: ${formData.sherwaniCrossBack}", 09 CrossFront: ${formData.sherwaniCrossFront}", 10 Bicep: ${formData.sherwaniBicep}", 11 ArmHole: ${formData.sherwaniArmHole}"`
        );
        web3FormData.append("sherwani_style", `Style: ${formData.sherwaniStyle}, Lapel: ${formData.sherwaniLapel}, Vent: ${formData.sherwaniVent}, Pocket: ${formData.sherwaniPocket}, Fit: ${formData.sherwaniFit}, SleevePlacket: ${formData.sherwaniSleevePlacket}, Code: ${formData.sherwaniCode}, Remarks: ${formData.sherwaniRemarks}`);
        web3FormData.append("trouser_measurements", 
          `01 Length: ${formData.trouserLength}", 02 Waist: ${formData.trouserWaist}", 03 Hip: ${formData.trouserHip}", 04 Thigh: ${formData.trouserThigh}", 05 Knee: ${formData.trouserKnee}", 06 Bottom: ${formData.trouserBottom}", 07 Crotch: ${formData.trouserCrotch}"`
        );
        web3FormData.append("trouser_style", `Belt: ${formData.trouserBelt}, Pleat: ${formData.trouserPleat}, Pocket: ${formData.trouserPocket}, BackPocket: ${formData.trouserBackPocket}, Bottom: ${formData.trouserBottomStyle}, Loops: ${formData.trouserLoops}, Fit: ${formData.trouserFit}, Size: ${formData.trouserSize}, Remarks: ${formData.trouserRemarks}`);
        web3FormData.append("shirt_measurements", 
          `Length: ${formData.shirtLength}", Chest: ${formData.shirtChest}", LowChest: ${formData.shirtLowChest}", Waist: ${formData.shirtWaist}", Hip: ${formData.shirtHip}", Sleeves: ${formData.shirtSleeves}", Shoulder: ${formData.shirtShoulder}", ArmRound: ${formData.shirtArmRound}", Neck: ${formData.shirtNeck}", Cuff: ${formData.shirtCuff}", Biceps: ${formData.shirtBiceps}"`
        );
        if (formData.specialNotes) web3FormData.append("special_instructions", formData.specialNotes);

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: web3FormData
        }).catch(err => console.warn("Web3Forms notice:", err));
      } catch (w3Err) {
        console.warn("Web3Forms error:", w3Err);
      }

      // 3. Dispatch to serverless endpoint /api/send-measurements
      try {
        await fetch('/api/send-measurements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } catch (apiErr) {
        console.warn('Backend endpoint logged notice:', apiErr);
      }

      // 4. FormSubmit direct failover to atelier inbox libastailor0@gmail.com
      try {
        fetch('https://formsubmit.co/ajax/libastailor0@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: `New LIBAS Tailor Measurement Profile — ${formData.name}`,
            _template: 'table',
            'Client Name': formData.name,
            'Phone / WhatsApp': formData.phone,
            'Email': formData.email || 'Not provided',
            'Order Reference': formData.orderRef || 'LIB-ATELIER',
            'Garment Type': formData.garment,
            'Body Posture': `Back: ${formData.postureBack}, Stomach: ${formData.postureStomach}, Shoulder: ${formData.postureShoulder}`,
            'Sherwani Measurements (Inches)': `01 Length: ${formData.sherwaniLength}, 02 Chest/LowChest: ${formData.sherwaniChest}, 03 Waist: ${formData.sherwaniWaist}, 04 Hip: ${formData.sherwaniHip}, 05 Sleeves: ${formData.sherwaniSleeves}, 06 Shoulder: ${formData.sherwaniShoulder}, 07 Neck: ${formData.sherwaniNeck}, 08 CrossBack: ${formData.sherwaniCrossBack}, 09 CrossFront: ${formData.sherwaniCrossFront}, 10 Bicep: ${formData.sherwaniBicep}, 11 ArmHole: ${formData.sherwaniArmHole}`,
            'Sherwani Style Details': `Style: ${formData.sherwaniStyle}, Lapel: ${formData.sherwaniLapel}, Vent: ${formData.sherwaniVent}, Pocket: ${formData.sherwaniPocket}, Fit: ${formData.sherwaniFit}, Sleeve Placket: ${formData.sherwaniSleevePlacket}, Code: ${formData.sherwaniCode || 'None'}, Remarks: ${formData.sherwaniRemarks || 'None'}`,
            'Trouser Measurements (Inches)': `01 Length: ${formData.trouserLength}, 02 Waist: ${formData.trouserWaist}, 03 Hip: ${formData.trouserHip}, 04 Thigh: ${formData.trouserThigh}, 05 Knee: ${formData.trouserKnee}, 06 Bottom: ${formData.trouserBottom}, 07 Crotch: ${formData.trouserCrotch}`,
            'Trouser Style Details': `Belt: ${formData.trouserBelt}, Pleat: ${formData.trouserPleat}, Pocket: ${formData.trouserPocket}, Back Pocket: ${formData.trouserBackPocket}, Bottom: ${formData.trouserBottomStyle}, Loops: ${formData.trouserLoops}, Fit: ${formData.trouserFit}, Size: ${formData.trouserSize || 'Standard'}, Remarks: ${formData.trouserRemarks || 'None'}`,
            'Shirt Measurements (Inches)': `Length: ${formData.shirtLength}, Chest: ${formData.shirtChest}, Low Chest: ${formData.shirtLowChest}, Waist: ${formData.shirtWaist}, Hip: ${formData.shirtHip}, Sleeves: ${formData.shirtSleeves}, Shoulder: ${formData.shirtShoulder}, Arm Round: ${formData.shirtArmRound}, Neck: ${formData.shirtNeck}, Cuff: ${formData.shirtCuff}, Biceps: ${formData.shirtBiceps}`,
            'Remarks / Special Notes': formData.specialNotes || 'None'
          })
        }).catch(fsErr => console.warn('FormSubmit notice:', fsErr));
      } catch (fsErr) {
        console.warn('FormSubmit dispatch notice:', fsErr);
      }

      // 5. Show Success Modal & Prepare WhatsApp Atelier Forwarding
      const successModal = document.getElementById('measurement-success-modal');
      const successClientName = document.getElementById('success-client-name');
      const btnManualDownload = document.getElementById('btn-manual-download-pdf');
      const btnWhatsappBackup = document.getElementById('btn-whatsapp-backup');

      if (successClientName) successClientName.textContent = formData.name;

      if (btnManualDownload) {
        btnManualDownload.onclick = () => {
          if (generatedPdfDoc) {
            generatedPdfDoc.save(pdfFilename);
          }
        };
      }

      // WhatsApp Forwarding text (+91 90276 72285)
      if (btnWhatsappBackup) {
        const waText = 
          `*New LIBAS Tailor Measurement Profile — ${formData.name}*\n\n` +
          `*CUSTOMER DETAILS:*\n` +
          `• *Name:* ${formData.name}\n` +
          `• *Phone:* ${formData.phone}\n` +
          `• *Email:* ${formData.email || '—'}\n` +
          `• *Garment:* ${formData.garment}\n` +
          `• *Order Ref:* ${formData.orderRef || 'LIB-ATELIER'}\n\n` +
          `*BODY POSTURE:*\n` +
          `• Back: ${formData.postureBack} | Stomach: ${formData.postureStomach} | Shoulder: ${formData.postureShoulder}\n\n` +
          `*SHERWANI MEASUREMENTS (INCHES):*\n` +
          (formData.sherwaniLength ? `• 01 Length: ${formData.sherwaniLength}"\n` : '') +
          (formData.sherwaniChest ? `• 02 Chest: ${formData.sherwaniChest}"\n` : '') +
          (formData.sherwaniWaist ? `• 03 Waist: ${formData.sherwaniWaist}"\n` : '') +
          (formData.sherwaniHip ? `• 04 Hip: ${formData.sherwaniHip}"\n` : '') +
          (formData.sherwaniSleeves ? `• 05 Sleeves: ${formData.sherwaniSleeves}"\n` : '') +
          (formData.sherwaniShoulder ? `• 06 Shoulder: ${formData.sherwaniShoulder}"\n` : '') +
          (formData.sherwaniNeck ? `• 07 Neck: ${formData.sherwaniNeck}"\n` : '') +
          (formData.sherwaniCrossBack ? `• 08 Cross Back: ${formData.sherwaniCrossBack}"\n` : '') +
          (formData.sherwaniCrossFront ? `• 09 Cross Front: ${formData.sherwaniCrossFront}"\n` : '') +
          (formData.sherwaniBicep ? `• 10 Bicep: ${formData.sherwaniBicep}"\n` : '') +
          (formData.sherwaniArmHole ? `• 11 Arm Hole: ${formData.sherwaniArmHole}"\n` : '') +
          `• Style: ${formData.sherwaniStyle} | Lapel: ${formData.sherwaniLapel} | Vent: ${formData.sherwaniVent} | Pocket: ${formData.sherwaniPocket}\n\n` +
          `*TROUSER MEASUREMENTS (INCHES):*\n` +
          (formData.trouserLength ? `• 01 Length: ${formData.trouserLength}"\n` : '') +
          (formData.trouserWaist ? `• 02 Waist: ${formData.trouserWaist}"\n` : '') +
          (formData.trouserHip ? `• 03 Hip: ${formData.trouserHip}"\n` : '') +
          (formData.trouserThigh ? `• 04 Thigh: ${formData.trouserThigh}"\n` : '') +
          (formData.trouserKnee ? `• 05 Knee: ${formData.trouserKnee}"\n` : '') +
          (formData.trouserBottom ? `• 06 Bottom: ${formData.trouserBottom}"\n` : '') +
          (formData.trouserCrotch ? `• 07 Crotch: ${formData.trouserCrotch}"\n` : '') +
          `• Belt: ${formData.trouserBelt} | Pleat: ${formData.trouserPleat} | Fit: ${formData.trouserFit}\n\n` +
          (formData.specialNotes ? `*REMARKS:* ${formData.specialNotes}\n\n` : '') +
          `_Generated via LIBAS TAILOR Digital Measurement System (Shamshad Market, AMU Aligarh)_`;

        btnWhatsappBackup.href = `https://wa.me/919027672285?text=${encodeURIComponent(waText)}`;
      }

      if (successModal) {
        successModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }

    } catch (err) {
      console.error('Error generating measurement document:', err);
      alert('An error occurred generating your bespoke measurement PDF. Please check your entered values and try again.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'SUBMIT BESPOKE MEASUREMENTS & RECEIVE PDF';
      }
    }
  });

  // Close Success Modal
  const btnCloseSuccess = document.getElementById('close-success-modal');
  const successModal = document.getElementById('measurement-success-modal');
  if (btnCloseSuccess && successModal) {
    btnCloseSuccess.addEventListener('click', () => {
      successModal.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }
});
