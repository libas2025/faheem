// LIBAS TAILOR — Bespoke Measurement Engine & PDF Generation System
import { jsPDF } from 'jspdf';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('measurements-form');
  if (!form) return;

  let currentUnit = 'cm'; // 'cm' or 'inch'
  let generatedPdfDoc = null;
  let lastSubmittedData = null;

  // 1. Unit Toggle Handler (CM <-> INCHES)
  const btnCm = document.getElementById('unit-cm');
  const btnInch = document.getElementById('unit-inch');
  const unitAffixes = document.querySelectorAll('.unit-affix');
  const numericInputs = document.querySelectorAll('.num-measure');

  function setUnit(newUnit) {
    if (newUnit === currentUnit) return;

    numericInputs.forEach(input => {
      const val = parseFloat(input.value);
      if (!isNaN(val) && val > 0) {
        if (newUnit === 'inch') {
          // cm to inches
          input.value = (val / 2.54).toFixed(1);
        } else {
          // inches to cm
          input.value = (val * 2.54).toFixed(1);
        }
      }
    });

    currentUnit = newUnit;
    unitAffixes.forEach(affix => {
      affix.textContent = currentUnit.toUpperCase();
    });

    if (currentUnit === 'cm') {
      btnCm?.classList.add('active');
      btnInch?.classList.remove('active');
    } else {
      btnInch?.classList.add('active');
      btnCm?.classList.remove('active');
    }
  }

  btnCm?.addEventListener('click', () => setUnit('cm'));
  btnInch?.addEventListener('click', () => setUnit('inch'));

  // 2. Validation Helper
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
        errorMsg = 'Please enter a valid positive number.';
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

  // Live validation on blur
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('field-error-border')) {
        validateField(input);
      }
    });
  });

  // 3. Generate High-End Branded PDF Document
  function generateBespokePDF(data) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background Warm Ivory Accent
    doc.setFillColor(250, 247, 240);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Outer Antique Gold Border
    doc.setDrawColor(198, 161, 91);
    doc.setLineWidth(0.8);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    // Inner Subtle Border
    doc.setDrawColor(198, 161, 91);
    doc.setLineWidth(0.2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Header: LIBAS TAILOR
    doc.setTextColor(85, 16, 15); // Royal Burgundy
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text('LIBAS TAILOR', pageWidth / 2, 22, { align: 'center' });

    doc.setTextColor(198, 161, 91); // Antique Gold
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('BESPOKE MENSWEAR ATELIER &bull; SHAMSHAD MARKET, AMU ALIGARH', pageWidth / 2, 27, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(60, 50, 40);
    doc.text('Client Bespoke Measurement Profile', pageWidth / 2, 33, { align: 'center' });

    // Fine Gold Rule
    doc.setDrawColor(198, 161, 91);
    doc.setLineWidth(0.5);
    doc.line(16, 36, pageWidth - 16, 36);

    // Client Information Section
    let y = 43;
    doc.setFillColor(242, 235, 221); // Soft Cream
    doc.rect(16, y, pageWidth - 32, 20, 'F');
    doc.setDrawColor(198, 161, 91);
    doc.rect(16, y, pageWidth - 32, 20, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(85, 16, 15);
    doc.text('CLIENT DETAILS', 20, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(36, 33, 30);
    doc.text(`Name: ${data.name}`, 20, y + 11);
    doc.text(`Phone: ${data.phone}`, 20, y + 16);
    doc.text(`Email: ${data.email}`, 90, y + 11);
    doc.text(`Contact Via: ${data.contactMethod}`, 90, y + 16);
    doc.text(`Date: ${data.date}`, 150, y + 11);
    doc.text(`Unit: ${data.unit.toUpperCase()}`, 150, y + 16);

    // Section 1: Upper Body
    y = 70;
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(85, 16, 15);
    doc.text('01. UPPER BODY MEASUREMENTS', 16, y);
    doc.setLineWidth(0.3);
    doc.line(16, y + 2, pageWidth - 16, y + 2);

    y += 8;
    const upperFields = [
      ['Neck', data.neck],
      ['Chest', data.chest],
      ['Shoulder Width', data.shoulder],
      ['Sleeve Length', data.sleeve],
      ['Bicep', data.bicep],
      ['Waist (Stomach)', data.waist],
      ['Waist (Natural)', data.waistNatural],
      ['Front Jacket Length', data.jacketLength],
      ['Back Length', data.backLength]
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    upperFields.forEach((item, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const posX = 18 + col * 58;
      const posY = y + row * 10;

      doc.setFillColor(255, 255, 255);
      doc.rect(posX, posY, 54, 7, 'F');
      doc.setDrawColor(220, 215, 205);
      doc.rect(posX, posY, 54, 7, 'S');

      doc.setTextColor(100, 90, 80);
      doc.text(`${item[0]}:`, posX + 2, posY + 4.8);
      doc.setTextColor(36, 33, 30);
      doc.setFont('helvetica', 'bold');
      const valText = item[1] ? `${item[1]} ${data.unit}` : '—';
      doc.text(valText, posX + 51, posY + 4.8, { align: 'right' });
      doc.setFont('helvetica', 'normal');
    });

    // Section 2: Lower Body
    y = 114;
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(85, 16, 15);
    doc.text('02. LOWER BODY MEASUREMENTS', 16, y);
    doc.setLineWidth(0.3);
    doc.line(16, y + 2, pageWidth - 16, y + 2);

    y += 8;
    const lowerFields = [
      ['Trouser Waist', data.trouserWaist],
      ['Hips', data.hips],
      ['Thigh', data.thigh],
      ['Inseam', data.inseam],
      ['Outseam', data.outseam],
      ['Knee', data.knee],
      ['Ankle Opening', data.ankle],
      ['Rise', data.rise]
    ];

    lowerFields.forEach((item, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const posX = 18 + col * 58;
      const posY = y + row * 10;

      doc.setFillColor(255, 255, 255);
      doc.rect(posX, posY, 54, 7, 'F');
      doc.setDrawColor(220, 215, 205);
      doc.rect(posX, posY, 54, 7, 'S');

      doc.setTextColor(100, 90, 80);
      doc.text(`${item[0]}:`, posX + 2, posY + 4.8);
      doc.setTextColor(36, 33, 30);
      doc.setFont('helvetica', 'bold');
      const valText = item[1] ? `${item[1]} ${data.unit}` : '—';
      doc.text(valText, posX + 51, posY + 4.8, { align: 'right' });
      doc.setFont('helvetica', 'normal');
    });

    // Section 3: Fit & Garment Preferences
    y = 158;
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(85, 16, 15);
    doc.text('03. FIT PREFERENCES & ATELIER NOTES', 16, y);
    doc.setLineWidth(0.3);
    doc.line(16, y + 2, pageWidth - 16, y + 2);

    y += 8;
    doc.setFillColor(255, 255, 255);
    doc.rect(16, y, pageWidth - 32, 14, 'F');
    doc.setDrawColor(198, 161, 91);
    doc.rect(16, y, pageWidth - 32, 14, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(36, 33, 30);
    doc.text(`Primary Garment: ${data.garment}`, 20, y + 5.5);
    doc.text(`Preferred Fit Stance: ${data.fit}`, 80, y + 5.5);
    doc.text(`Posture Notes: ${data.posture || 'Standard'}`, 140, y + 5.5);

    doc.text(`Client Address / Note: ${data.address || 'In-store fitting at Shamshad Market atelier'}`, 20, y + 10.5);

    // Special Requirements
    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(85, 16, 15);
    doc.text('SPECIAL REQUIREMENTS & DESIGN INSTRUCTIONS:', 16, y);

    y += 4;
    doc.setFillColor(255, 255, 255);
    doc.rect(16, y, pageWidth - 32, 40, 'F');
    doc.setDrawColor(220, 215, 205);
    doc.rect(16, y, pageWidth - 32, 40, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 55, 50);
    const splitNotes = doc.splitTextToSize(data.notes || 'None specified. Standard bespoke tailoring consultation.', pageWidth - 40);
    doc.text(splitNotes, 20, y + 6);

    // Footer & Disclaimer
    const footerY = pageHeight - 20;
    doc.setDrawColor(198, 161, 91);
    doc.setLineWidth(0.4);
    doc.line(16, footerY, pageWidth - 16, footerY);

    doc.setFont('times', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 100, 90);
    doc.text(
      'This measurement profile is recorded for bespoke tailoring consultations at LIBAS TAILOR, Shamshad Market, opposite Sulaiman Hall, AMU Aligarh.',
      pageWidth / 2,
      footerY + 4,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(85, 16, 15);
    doc.text('LIBAS TAILOR &bull; Phone / WhatsApp: +91 90276 72285 &bull; info@libastailors.com &bull; libastailors.com', pageWidth / 2, footerY + 8, { align: 'center' });

    return doc;
  }

  // 4. Form Submission Handler
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
      submitBtn.innerText = 'PROCESSING & GENERATING BESPOKE PDF...';
    }

    // Collect structured measurement data
    const formData = {
      name: document.getElementById('client-name')?.value || '',
      email: document.getElementById('client-email')?.value || '',
      phone: document.getElementById('client-phone')?.value || '',
      contactMethod: document.getElementById('client-contact-method')?.value || 'WhatsApp',
      address: document.getElementById('client-address')?.value || '',
      unit: currentUnit,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      timestamp: new Date().toISOString(),

      // Upper Body
      neck: document.getElementById('measure-neck')?.value || '',
      chest: document.getElementById('measure-chest')?.value || '',
      shoulder: document.getElementById('measure-shoulder')?.value || '',
      sleeve: document.getElementById('measure-sleeve')?.value || '',
      bicep: document.getElementById('measure-bicep')?.value || '',
      waist: document.getElementById('measure-waist')?.value || '',
      waistNatural: document.getElementById('measure-waist-natural')?.value || '',
      jacketLength: document.getElementById('measure-jacket-length')?.value || '',
      backLength: document.getElementById('measure-back-length')?.value || '',

      // Lower Body
      trouserWaist: document.getElementById('measure-trouser-waist')?.value || '',
      hips: document.getElementById('measure-hips')?.value || '',
      thigh: document.getElementById('measure-thigh')?.value || '',
      inseam: document.getElementById('measure-inseam')?.value || '',
      outseam: document.getElementById('measure-outseam')?.value || '',
      knee: document.getElementById('measure-knee')?.value || '',
      ankle: document.getElementById('measure-ankle')?.value || '',
      rise: document.getElementById('measure-rise')?.value || '',

      // Fit Preferences
      fit: document.querySelector('input[name="fit_preference"]:checked')?.value || 'Regular',
      garment: document.getElementById('garment-type')?.value || 'Sherwani',
      posture: document.getElementById('posture-type')?.value || 'Standard',
      notes: document.getElementById('special-notes')?.value || ''
    };

    lastSubmittedData = formData;

    try {
      // 1. Generate and auto-download PDF
      generatedPdfDoc = generateBespokePDF(formData);
      const safeName = formData.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Client';
      const pdfFilename = `LIBAS_Bespoke_Measurement_${safeName}.pdf`;
      generatedPdfDoc.save(pdfFilename);

      // 2. Dispatch to Backend/Serverless Email Endpoint (/api/send-measurements)
      try {
        await fetch('/api/send-measurements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } catch (apiErr) {
        console.warn('API notification logged. Operational email endpoint fallback available.', apiErr);
      }

      // 3. Show Success Modal & State
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

      // Prepare instant WhatsApp dispatch to +91 90276 72285
      if (btnWhatsappBackup) {
        const waSummary = `*New Bespoke Measurement Profile — LIBAS TAILOR*\n\n` +
          `• *Client Name:* ${formData.name}\n` +
          `• *Contact:* ${formData.phone} (${formData.email})\n` +
          `• *Garment:* ${formData.garment} (Fit: ${formData.fit})\n` +
          `• *Unit:* ${formData.unit.toUpperCase()}\n\n` +
          `*Key Measurements:*\n` +
          (formData.chest ? `• Chest: ${formData.chest} ${formData.unit}\n` : '') +
          (formData.waist ? `• Waist: ${formData.waist} ${formData.unit}\n` : '') +
          (formData.shoulder ? `• Shoulder: ${formData.shoulder} ${formData.unit}\n` : '') +
          (formData.sleeve ? `• Sleeve: ${formData.sleeve} ${formData.unit}\n` : '') +
          (formData.trouserWaist ? `• Trouser Waist: ${formData.trouserWaist} ${formData.unit}\n` : '') +
          (formData.outseam ? `• Outseam: ${formData.outseam} ${formData.unit}\n` : '') +
          (formData.notes ? `\n• *Notes:* ${formData.notes}\n` : '') +
          `\n_Generated via LIBAS TAILOR Digital Measurement System (Shamshad Market, AMU Aligarh)_`;

        btnWhatsappBackup.href = `https://wa.me/919027672285?text=${encodeURIComponent(waSummary)}`;
      }

      if (successModal) {
        successModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }

    } catch (err) {
      console.error('Error generating measurement document:', err);
      alert('An error occurred generating your measurement PDF. Please check your entered values and try again.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'SUBMIT MEASUREMENTS & RECEIVE PDF';
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
