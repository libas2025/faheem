/**
 * LIBAS TAILOR — Serverless / Backend Transactional Email Endpoint
 * Digitized Client Measurement System (Inches Metrology)
 */

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    
    // Validate essential client details
    if (!data || !data.name || !data.phone) {
      return res.status(400).json({ error: 'Missing required client information (name, phone).' });
    }

    const recipientEmail = process.env.EMAIL_TO || 'libastailor0@gmail.com';
    const senderEmail = process.env.EMAIL_FROM || 'concierge@libastailor.in';
    const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_SERVICE_KEY;

    // Structured Email Subject as specified: New LIBAS Tailor Measurement Profile — [Customer Name]
    const emailSubject = `New LIBAS Tailor Measurement Profile — ${data.name}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #FAF7F0; padding: 25px; color: #24211E;">
        <div style="max-width: 700px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #C6A15B; padding: 30px;">
          
          <div style="text-align: center; border-bottom: 2px solid #55100F; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #55100F; margin: 0; font-size: 26px; letter-spacing: 2px;">LIBAS TAILOR</h1>
            <p style="color: #C6A15B; margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">
              ALIGARH &bull; Bespoke Menswear Atelier
            </p>
            <p style="color: #666; margin: 4px 0 0; font-size: 12px; font-style: italic;">
              Official Client Measurement Profile &bull; Shamshad Market, AMU Aligarh
            </p>
          </div>

          <!-- 1. Customer Information -->
          <h3 style="color: #55100F; border-bottom: 1px solid #E5E0D5; padding-bottom: 5px; margin-top: 20px;">Customer Information</h3>
          <p style="margin: 4px 0;"><strong>Full Name:</strong> ${data.name}</p>
          <p style="margin: 4px 0;"><strong>Phone / WhatsApp:</strong> ${data.phone}</p>
          <p style="margin: 4px 0;"><strong>Email Address:</strong> ${data.email || 'Not provided'}</p>
          <p style="margin: 4px 0;"><strong>Order / Reference:</strong> ${data.orderRef || 'LIB-ATELIER'}</p>
          <p style="margin: 4px 0;"><strong>Garment Type:</strong> ${data.garment || 'Sherwani'}</p>
          <p style="margin: 4px 0;"><strong>Preferred Contact Method:</strong> ${data.contactMethod || 'WhatsApp'}</p>
          <p style="margin: 4px 0;"><strong>Fitting Venue / Address:</strong> ${data.address || 'In-store fitting at Shamshad Market atelier'}</p>
          <p style="margin: 4px 0;"><strong>Submission Date:</strong> ${data.date || new Date().toLocaleDateString('en-IN')}</p>

          <!-- 2. Body Posture -->
          <h3 style="color: #55100F; border-bottom: 1px solid #E5E0D5; padding-bottom: 5px; margin-top: 25px;">Body Posture</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Back Shape: <strong>${data.postureBack || 'Normal'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Stomach: <strong>${data.postureStomach || 'Normal'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Shoulder Type: <strong>${data.postureShoulder || 'Regular'}</strong></td>
            </tr>
          </table>

          <!-- 3. Sherwani Measurements -->
          <h3 style="color: #55100F; border-bottom: 1px solid #E5E0D5; padding-bottom: 5px; margin-top: 25px;">Sherwani Measurements (Inches)</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">01. Length: <strong>${data.sherwaniLength ? data.sherwaniLength + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">02. Chest / Low Chest: <strong>${data.sherwaniChest ? data.sherwaniChest + '"' : '—'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">03. Waist: <strong>${data.sherwaniWaist ? data.sherwaniWaist + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">04. Hip: <strong>${data.sherwaniHip ? data.sherwaniHip + '"' : '—'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">05. Sleeves: <strong>${data.sherwaniSleeves ? data.sherwaniSleeves + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">06. Shoulder: <strong>${data.sherwaniShoulder ? data.sherwaniShoulder + '"' : '—'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">07. Neck: <strong>${data.sherwaniNeck ? data.sherwaniNeck + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">08. Cross Back: <strong>${data.sherwaniCrossBack ? data.sherwaniCrossBack + '"' : '—'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">09. Cross Front: <strong>${data.sherwaniCrossFront ? data.sherwaniCrossFront + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">10. Bicep: <strong>${data.sherwaniBicep ? data.sherwaniBicep + '"' : '—'}</strong></td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 6px; border: 1px solid #E5E0D5;">11. Arm Hole Round: <strong>${data.sherwaniArmHole ? data.sherwaniArmHole + '"' : '—'}</strong></td>
            </tr>
          </table>

          <!-- 4. Sherwani Style Details -->
          <h3 style="color: #55100F; border-bottom: 1px solid #E5E0D5; padding-bottom: 5px; margin-top: 25px;">Sherwani Style Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Style: <strong>${data.sherwaniStyle || 'SB'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Lapel: <strong>${data.sherwaniLapel || 'Mandarin Collar'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Vent: <strong>${data.sherwaniVent || 'Side Vent'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Pocket: <strong>${data.sherwaniPocket || 'Slant'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Fit: <strong>${data.sherwaniFit || 'Regular Fit'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Sleeve Placket: <strong>${data.sherwaniSleevePlacket || 'Vent'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Others / Code: <strong>${data.sherwaniCode || 'None'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Remarks: <strong>${data.sherwaniRemarks || 'None'}</strong></td>
            </tr>
          </table>

          <!-- 5. Trouser Measurements -->
          <h3 style="color: #55100F; border-bottom: 1px solid #E5E0D5; padding-bottom: 5px; margin-top: 25px;">Trouser Measurements (Inches)</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">01. Length: <strong>${data.trouserLength ? data.trouserLength + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">02. Waist: <strong>${data.trouserWaist ? data.trouserWaist + '"' : '—'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">03. Hip: <strong>${data.trouserHip ? data.trouserHip + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">04. Thigh: <strong>${data.trouserThigh ? data.trouserThigh + '"' : '—'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">05. Knee: <strong>${data.trouserKnee ? data.trouserKnee + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">06. Bottom: <strong>${data.trouserBottom ? data.trouserBottom + '"' : '—'}</strong></td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 6px; border: 1px solid #E5E0D5;">07. Crotch: <strong>${data.trouserCrotch ? data.trouserCrotch + '"' : '—'}</strong></td>
            </tr>
          </table>

          <!-- 6. Trouser Style Details -->
          <h3 style="color: #55100F; border-bottom: 1px solid #E5E0D5; padding-bottom: 5px; margin-top: 25px;">Trouser Style Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Belt Style: <strong>${data.trouserBelt || 'Standard Belt'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Pleat: <strong>${data.trouserPleat || 'Flat Front'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Pocket: <strong>${data.trouserPocket || 'Cross Pocket'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Back Pocket: <strong>${data.trouserBackPocket || 'Single Pocket'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Bottom: <strong>${data.trouserBottomStyle || 'Plain Bottom'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Loops: <strong>${data.trouserLoops || 'With Loops'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Fit: <strong>${data.trouserFit || 'Regular Fit'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Size: <strong>${data.trouserSize || 'Standard'}</strong></td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 6px; border: 1px solid #E5E0D5;">Trouser Remarks: <strong>${data.trouserRemarks || 'None'}</strong></td>
            </tr>
          </table>

          <!-- 7. Shirt Measurements -->
          <h3 style="color: #55100F; border-bottom: 1px solid #E5E0D5; padding-bottom: 5px; margin-top: 25px;">Shirt Measurements (Inches)</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Length: <strong>${data.shirtLength ? data.shirtLength + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Chest: <strong>${data.shirtChest ? data.shirtChest + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Low Chest: <strong>${data.shirtLowChest ? data.shirtLowChest + '"' : '—'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Waist: <strong>${data.shirtWaist ? data.shirtWaist + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Hip: <strong>${data.shirtHip ? data.shirtHip + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Sleeves: <strong>${data.shirtSleeves ? data.shirtSleeves + '"' : '—'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Shoulder: <strong>${data.shirtShoulder ? data.shirtShoulder + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Arm Round: <strong>${data.shirtArmRound ? data.shirtArmRound + '"' : '—'}</strong></td>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Neck: <strong>${data.shirtNeck ? data.shirtNeck + '"' : '—'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #E5E0D5;">Cuff: <strong>${data.shirtCuff ? data.shirtCuff + '"' : '—'}</strong></td>
              <td colspan="2" style="padding: 6px; border: 1px solid #E5E0D5;">Biceps: <strong>${data.shirtBiceps ? data.shirtBiceps + '"' : '—'}</strong></td>
            </tr>
          </table>

          <!-- 8. Remarks -->
          <h3 style="color: #55100F; border-bottom: 1px solid #E5E0D5; padding-bottom: 5px; margin-top: 25px;">Special Instructions & Atelier Remarks</h3>
          <p style="background: #FAF7F0; padding: 12px; border: 1px solid #E5E0D5; font-size: 13px;">
            ${data.specialNotes || 'None specified. Standard bespoke tailoring consultation.'}
          </p>

          <div style="margin-top: 30px; border-top: 1px solid #C6A15B; padding-top: 15px; text-align: center; font-size: 11px; color: #777;">
            LIBAS TAILOR &bull; Aligarh &bull; Shamshad Market, opposite Sulaiman Hall, AMU Aligarh &bull; +91 90276 72285
          </div>
        </div>
      </div>
    `;

    // 1. Persist measurement profile to data/leads.json
    try {
      const dataDir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const leadsFile = path.join(dataDir, 'leads.json');
      let leads = [];
      if (fs.existsSync(leadsFile)) {
        try {
          const raw = fs.readFileSync(leadsFile, 'utf-8');
          leads = JSON.parse(raw);
          if (!Array.isArray(leads)) leads = [];
        } catch {
          leads = [];
        }
      }
      leads.push({
        id: `measure_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        source: 'Bespoke Measurement Metrology Form',
        submittedAt: new Date().toISOString(),
        ...data
      });
      fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('Measurement persistence warning:', fsErr.message);
    }

    // 2. FormSubmit Dispatch for Measurements (Direct delivery to atelier inbox: libastailor0@gmail.com)
    let formSubmitDispatched = false;
    try {
      const recipient = process.env.EMAIL_TO || 'libastailor0@gmail.com';
      const fsRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://libastailor.in',
          'Referer': 'https://libastailor.in/measurements.html',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          _subject: `New LIBAS Tailor Measurement Profile — ${data.name}`,
          _template: 'table',
          'Client Name': data.name,
          'Phone / WhatsApp': data.phone,
          'Email': data.email || 'Not provided',
          'Order Reference': data.orderRef || 'LIB-ATELIER',
          'Garment Type': data.garment || 'Sherwani',
          'Body Posture': `Back: ${data.postureBack || 'Normal'}, Stomach: ${data.postureStomach || 'Normal'}, Shoulder: ${data.postureShoulder || 'Regular'}`,
          'Sherwani Measurements (Inches)': `01 Length: ${data.sherwaniLength || '—'}, 02 Chest: ${data.sherwaniChest || '—'}, 03 Waist: ${data.sherwaniWaist || '—'}, 04 Hip: ${data.sherwaniHip || '—'}, 05 Sleeves: ${data.sherwaniSleeves || '—'}, 06 Shoulder: ${data.sherwaniShoulder || '—'}, 07 Neck: ${data.sherwaniNeck || '—'}, 08 CrossBack: ${data.sherwaniCrossBack || '—'}, 09 CrossFront: ${data.sherwaniCrossFront || '—'}, 10 Bicep: ${data.sherwaniBicep || '—'}, 11 ArmHole: ${data.sherwaniArmHole || '—'}`,
          'Sherwani Style Details': `Style: ${data.sherwaniStyle || 'SB'}, Lapel: ${data.sherwaniLapel || 'Mandarin Collar'}, Vent: ${data.sherwaniVent || 'Side Vent'}, Pocket: ${data.sherwaniPocket || 'Slant'}, Fit: ${data.sherwaniFit || 'Regular Fit'}, Sleeve Placket: ${data.sherwaniSleevePlacket || 'Vent'}, Code: ${data.sherwaniCode || 'None'}, Remarks: ${data.sherwaniRemarks || 'None'}`,
          'Trouser Measurements (Inches)': `01 Length: ${data.trouserLength || '—'}, 02 Waist: ${data.trouserWaist || '—'}, 03 Hip: ${data.trouserHip || '—'}, 04 Thigh: ${data.trouserThigh || '—'}, 05 Knee: ${data.trouserKnee || '—'}, 06 Bottom: ${data.trouserBottom || '—'}, 07 Crotch: ${data.trouserCrotch || '—'}`,
          'Trouser Style Details': `Belt: ${data.trouserBelt || 'Standard Belt'}, Pleat: ${data.trouserPleat || 'Flat Front'}, Pocket: ${data.trouserPocket || 'Cross Pocket'}, BackPocket: ${data.trouserBackPocket || 'Single Pocket'}, Bottom: ${data.trouserBottomStyle || 'Plain Bottom'}, Loops: ${data.trouserLoops || 'With Loops'}, Fit: ${data.trouserFit || 'Regular Fit'}, Size: ${data.trouserSize || 'Standard'}, Remarks: ${data.trouserRemarks || 'None'}`,
          'Shirt Measurements (Inches)': `Length: ${data.shirtLength || '—'}, Chest: ${data.shirtChest || '—'}, Low Chest: ${data.shirtLowChest || '—'}, Waist: ${data.shirtWaist || '—'}, Hip: ${data.shirtHip || '—'}, Sleeves: ${data.shirtSleeves || '—'}, Shoulder: ${data.shirtShoulder || '—'}, Arm Round: ${data.shirtArmRound || '—'}, Neck: ${data.shirtNeck || '—'}, Cuff: ${data.shirtCuff || '—'}, Biceps: ${data.shirtBiceps || '—'}`,
          'Fitting Address': data.address || 'In-store fitting at Shamshad Market atelier',
          'Remarks / Special Notes': data.specialNotes || 'None'
        })
      });
      if (fsRes.ok) {
        formSubmitDispatched = true;
      }
    } catch (fsErr) {
      console.warn('FormSubmit measurement dispatch error:', fsErr.message);
    }

    // 3. If Resend API key is configured, send transactional email
    if (apiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: senderEmail,
            to: recipientEmail,
            subject: emailSubject,
            html: emailHtml
          })
        });
      } catch (resendErr) {
        console.warn('Resend email dispatch error:', resendErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Measurement profile received and registered successfully.',
      formSubmitDispatched
    });

  } catch (error) {
    console.error('Measurement submission endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error processing measurements.' });
  }
}
