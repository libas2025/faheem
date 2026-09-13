/**
 * LIBAS TAILOR — Serverless / Backend Transactional Email Endpoint
 * 
 * Deployment Environments:
 * - Vercel Serverless Functions (/api/send-measurements)
 * - Netlify Functions (/api/send-measurements)
 * - Express / Node.js Backend
 * 
 * Configured via Environment Variables:
 * - EMAIL_TO (e.g., info@libastailors.com or owner's email)
 * - EMAIL_FROM (e.g., concierge@libastailors.com)
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

    const recipientEmail = process.env.EMAIL_TO || 'info@libastailors.com';
    const senderEmail = process.env.EMAIL_FROM || 'concierge@libastailors.com';
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

    // If Resend API key is configured, send actual transactional email
    if (apiKey) {
      const response = await fetch('https://api.resend.com/emails', {
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

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error('Email provider error response:', errorDetails);
        return res.status(502).json({ error: 'Failed sending through transactional email service.' });
      }

      const resData = await response.json();
      return res.status(200).json({ success: true, messageId: resData.id });
    } else {
      // Graceful fallback when running locally or before adding API key
      console.log('--- BESPOKE MEASUREMENT RECORD RECEIVED ---');
      console.log('Client:', data.name, 'Phone:', data.phone);
      console.log('Notice: Set RESEND_API_KEY and EMAIL_TO in production environment to dispatch transactional email.');
      return res.status(200).json({ 
        success: true, 
        mock: true, 
        message: 'Measurement profile received. Set RESEND_API_KEY in environment variables for automated email dispatch.' 
      });
    }

  } catch (error) {
    console.error('Measurement submission endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error processing measurements.' });
  }
}
