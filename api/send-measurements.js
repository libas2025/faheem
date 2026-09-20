/**
 * LIBAS TAILOR — Serverless / Backend Transactional Email Endpoint
 * 
 * Deployment Environments:
 * - Vercel Serverless Functions (/api/send-measurements)
 * - Netlify Functions (/api/send-measurements)
 * - Express / Node.js Backend
 * 
 * Configured via Environment Variables:
 * - EMAIL_TO (e.g., info@libastailor.in or owner's email)
 * - EMAIL_FROM (e.g., concierge@libastailor.in)
 * - RESEND_API_KEY or SENDGRID_API_KEY
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    
    // Validate essential client details
    if (!data || !data.name || !data.phone || !data.email) {
      return res.status(400).json({ error: 'Missing required client information (name, phone, email).' });
    }

    const recipientEmail = process.env.EMAIL_TO || 'info@libastailor.in';
    const senderEmail = process.env.EMAIL_FROM || 'concierge@libastailor.in';
    const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_SERVICE_KEY;

    // Structured Email Content
    const emailSubject = `New LIBAS Tailor Measurement Profile — ${data.name}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #FAF7F0; padding: 25px; color: #24211E;">
        <div style="max-width: 650px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #C6A15B; padding: 30px;">
          
          <div style="text-align: center; border-bottom: 2px solid #55100F; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #55100F; margin: 0; font-size: 24px; letter-spacing: 2px;">LIBAS TAILOR</h1>
            <p style="color: #C6A15B; margin: 5px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;">
              Bespoke Measurement Profile &bull; Shamshad Market, AMU Aligarh
            </p>
          </div>

          <h3 style="color: #55100F; border-bottom: 1px solid #E5E0D5; padding-bottom: 5px;">Client Information</h3>
          <p><strong>Full Name:</strong> ${data.name}</p>
          <p><strong>Phone / WhatsApp:</strong> ${data.phone}</p>
          <p><strong>Email Address:</strong> ${data.email}</p>
          <p><strong>Preferred Contact Method:</strong> ${data.contactMethod || 'WhatsApp'}</p>
          <p><strong>Delivery / Address Notes:</strong> ${data.address || 'In-store consultation'}</p>
          <p><strong>Unit of Measure:</strong> ${data.unit ? data.unit.toUpperCase() : 'CM'}</p>
          <p><strong>Submission Date:</strong> ${data.date || new Date().toISOString()}</p>

          <h3 style="color: #55100F; border-bottom: 1px solid #E5E0D5; padding-bottom: 5px; margin-top: 25px;">Upper Body Measurements (${data.unit || 'cm'})</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr><td style="padding: 6px; border: 1px solid #E5E0D5;">Neck: <strong>${data.neck || '—'}</strong></td><td style="padding: 6px; border: 1px solid #E5E0D5;">Chest: <strong>${data.chest || '—'}</strong></td></tr>
            <tr><td style="padding: 6px; border: 1px solid #E5E0D5;">Shoulder Width: <strong>${data.shoulder || '—'}</strong></td><td style="padding: 6px; border: 1px solid #E5E0D5;">Sleeve Length: <strong>${data.sleeve || '—'}</strong></td></tr>
            <tr><td style="padding: 6px; border: 1px solid #E5E0D5;">Bicep: <strong>${data.bicep || '—'}</strong></td><td style="padding: 6px; border: 1px solid #E5E0D5;">Waist (Stomach): <strong>${data.waist || '—'}</strong></td></tr>
            <tr><td style="padding: 6px; border: 1px solid #E5E0D5;">Waist (Natural): <strong>${data.waistNatural || '—'}</strong></td><td style="padding: 6px; border: 1px solid #E5E0D5;">Front Jacket Length: <strong>${data.jacketLength || '—'}</strong></td></tr>
            <tr><td colspan="2" style="padding: 6px; border: 1px solid #E5E0D5;">Back Length: <strong>${data.backLength || '—'}</strong></td></tr>
          </table>

          <h3 style="color: #55100F; border-bottom: 1px solid #E5E0D5; padding-bottom: 5px; margin-top: 25px;">Lower Body Measurements (${data.unit || 'cm'})</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr><td style="padding: 6px; border: 1px solid #E5E0D5;">Trouser Waist: <strong>${data.trouserWaist || '—'}</strong></td><td style="padding: 6px; border: 1px solid #E5E0D5;">Hips: <strong>${data.hips || '—'}</strong></td></tr>
            <tr><td style="padding: 6px; border: 1px solid #E5E0D5;">Thigh: <strong>${data.thigh || '—'}</strong></td><td style="padding: 6px; border: 1px solid #E5E0D5;">Inseam: <strong>${data.inseam || '—'}</strong></td></tr>
            <tr><td style="padding: 6px; border: 1px solid #E5E0D5;">Outseam: <strong>${data.outseam || '—'}</strong></td><td style="padding: 6px; border: 1px solid #E5E0D5;">Knee: <strong>${data.knee || '—'}</strong></td></tr>
            <tr><td style="padding: 6px; border: 1px solid #E5E0D5;">Ankle Opening: <strong>${data.ankle || '—'}</strong></td><td style="padding: 6px; border: 1px solid #E5E0D5;">Rise: <strong>${data.rise || '—'}</strong></td></tr>
          </table>

          <h3 style="color: #55100F; border-bottom: 1px solid #E5E0D5; padding-bottom: 5px; margin-top: 25px;">Fit & Silhouette Preferences</h3>
          <p><strong>Primary Garment:</strong> ${data.garment || 'Sherwani'}</p>
          <p><strong>Preferred Stance / Fit:</strong> ${data.fit || 'Regular'}</p>
          <p><strong>Posture:</strong> ${data.posture || 'Standard'}</p>
          <p><strong>Special Requirements & Design Notes:</strong><br>${data.notes || 'None'}</p>

          <div style="margin-top: 30px; border-top: 1px solid #C6A15B; padding-top: 15px; text-align: center; font-size: 11px; color: #777;">
            LIBAS TAILOR &bull; Shamshad Market, opposite Sulaiman Hall, AMU Aligarh &bull; +91 90276 72285
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
        source: 'Measurement Metrology Form',
        submittedAt: new Date().toISOString(),
        ...data
      });
      fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('Measurement persistence warning:', fsErr.message);
    }

    // 2. Dispatch via Web3Forms (Server-side)
    const web3AccessKey = process.env.WEB3FORMS_KEY || '7097fd8c-680d-4e0a-86d8-0d53621e4b47';
    let web3Dispatched = false;

    try {
      const web3Res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: web3AccessKey,
          subject: `New Bespoke Measurement Profile: ${data.name} (${data.garment || 'Sherwani'})`,
          from_name: 'LIBAS TAILOR Measurement Engine',
          name: data.name,
          phone: data.phone,
          email: data.email || 'Not provided',
          garment: data.garment || 'Sherwani',
          fit: data.fit || 'Regular',
          posture: data.posture || 'Standard',
          unit: data.unit || 'cm',
          notes: data.notes || 'None',
          message: `NEW BESPOKE MEASUREMENT PROFILE\n\nClient Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nGarment: ${data.garment}\nFit: ${data.fit}\nPosture: ${data.posture}\nUnit: ${data.unit}\nAddress/Notes: ${data.address || 'N/A'}\nSpecial Notes: ${data.notes || 'None'}\n\nMEASUREMENTS:\nUpper Body:\nNeck: ${data.neck || '-'} | Chest: ${data.chest || '-'} | Shoulder: ${data.shoulder || '-'} | Sleeve: ${data.sleeve || '-'} | Bicep: ${data.bicep || '-'} | Stomach Waist: ${data.waist || '-'} | Natural Waist: ${data.waistNatural || '-'} | Jacket Length: ${data.jacketLength || '-'} | Back Length: ${data.backLength || '-'}\n\nLower Body:\nTrouser Waist: ${data.trouserWaist || '-'} | Hips: ${data.hips || '-'} | Thigh: ${data.thigh || '-'} | Inseam: ${data.inseam || '-'} | Outseam: ${data.outseam || '-'} | Knee: ${data.knee || '-'} | Ankle: ${data.ankle || '-'} | Rise: ${data.rise || '-'}`
        })
      });

      if (web3Res.ok) {
        web3Dispatched = true;
      }
    } catch (web3Err) {
      console.warn('Web3Forms measurement dispatch error:', web3Err.message);
    }

    // 3. FormSubmit Failover Dispatch for Measurements
    let formSubmitDispatched = false;
    try {
      const recipient = process.env.EMAIL_TO || 'libastailor0@gmail.com';
      const fsRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Referer': 'https://libastailor.in/measurements.html'
        },
        body: JSON.stringify({
          _subject: `New Bespoke Measurement Profile: ${data.name} (${data.garment || 'Sherwani'})`,
          _template: 'table',
          'Client Name': data.name,
          'Phone / WhatsApp': data.phone,
          'Email': data.email || 'Not provided',
          'Preferred Contact': data.contactMethod || 'WhatsApp',
          'Garment Silhouette': data.garment || 'Sherwani',
          'Fit Preference': data.fit || 'Regular',
          'Posture Type': data.posture || 'Standard',
          'Unit': data.unit || 'cm',
          'Neck': data.neck || '—',
          'Chest': data.chest || '—',
          'Shoulder': data.shoulder || '—',
          'Sleeve': data.sleeve || '—',
          'Bicep': data.bicep || '—',
          'Stomach Waist': data.waist || '—',
          'Natural Waist': data.waistNatural || '—',
          'Jacket Length': data.jacketLength || '—',
          'Back Length': data.backLength || '—',
          'Trouser Waist': data.trouserWaist || '—',
          'Hips': data.hips || '—',
          'Thigh': data.thigh || '—',
          'Inseam': data.inseam || '—',
          'Outseam': data.outseam || '—',
          'Knee': data.knee || '—',
          'Ankle': data.ankle || '—',
          'Rise': data.rise || '—',
          'Address / Notes': data.address || 'N/A',
          'Special Requirements': data.notes || 'None'
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
      web3Dispatched
    });

  } catch (error) {
    console.error('Measurement submission endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error processing measurements.' });
  }
}
