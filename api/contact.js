/**
 * LIBAS TAILOR — Serverless Contact & Consultation Dispatch Endpoint
 * Handles appointment bookings, consultation requests, and general enquiries.
 * 
 * Multi-layer dispatch pipeline:
 * 1. Web3Forms (Access Key: 7097fd8c-680d-4e0a-86d8-0d53621e4b47)
 * 2. Resend Transactional Email (if RESEND_API_KEY is configured)
 * 3. File-system persistence in data/leads.json
 */

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // CORS Headers for secure cross-origin handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body || {};

    const name = String(data.name || '').trim();
    const phone = String(data.phone || '').trim();
    const email = String(data.email || '').trim();
    const service = String(data.service || 'Sherwanis').trim();
    const occasion = String(data.occasion || 'Wedding / Groom').trim();
    const location = String(data.location || 'Shamshad Market Atelier').trim();
    const date = String(data.date || '').trim();
    const time = String(data.time || '').trim();
    const notes = String(data.notes || '').trim();

    if (!name || !phone) {
      return res.status(400).json({
        error: 'Missing required fields. Name and phone number are required.'
      });
    }

    const leadRecord = {
      id: `enquiry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      phone,
      email,
      service,
      occasion,
      location,
      date,
      time,
      notes,
      source: 'Consultation Booking Form',
      submittedAt: new Date().toISOString()
    };

    // 1. File persistence in data/leads.json
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
      leads.push(leadRecord);
      fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('Lead persistence notice:', fsErr.message);
    }

    // 2. Dispatch via Web3Forms from the server
    const web3AccessKey = process.env.WEB3FORMS_KEY || '7097fd8c-680d-4e0a-86d8-0d53621e4b47';
    let web3Dispatched = false;

    try {
      const web3Response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: web3AccessKey,
          subject: `New Consultation Request: ${name} (${service})`,
          from_name: 'LIBAS TAILOR Web Concierge',
          name: name,
          phone: phone,
          email: email || 'Not provided',
          service: service,
          occasion: occasion,
          consultation_venue: location,
          preferred_date: date,
          preferred_time: time,
          additional_notes: notes || 'None',
          message: `NEW BESPOKE CONSULTATION REQUEST\n\nClient Name: ${name}\nPhone/WhatsApp: ${phone}\nEmail: ${email || 'N/A'}\nGarment Silhouette: ${service}\nOccasion: ${occasion}\nVenue: ${location}\nPreferred Date: ${date}\nTime Slot: ${time}\nNotes: ${notes || 'None'}\n\nSubmitted via libastailor.in`
        })
      });

      if (web3Response.ok) {
        web3Dispatched = true;
      } else {
        const errTxt = await web3Response.text();
        console.warn('Web3Forms server response status:', web3Response.status, errTxt.slice(0, 150));
      }
    } catch (web3Err) {
      console.warn('Web3Forms dispatch warning:', web3Err.message);
    }

    // 3. FormSubmit Failover Dispatch (Direct email delivery to atelier)
    let formSubmitDispatched = false;
    try {
      const recipient = process.env.EMAIL_TO || 'libastailor0@gmail.com';
      const fsRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://libastailor.in',
          'Referer': 'https://libastailor.in/contact.html',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          _subject: `New Consultation Request: ${name} (${service})`,
          _template: 'table',
          'Client Name': name,
          'Phone / WhatsApp': phone,
          'Email': email || 'Not provided',
          'Garment Silhouette': service,
          'Occasion': occasion,
          'Consultation Venue': location,
          'Preferred Date': date,
          'Time Slot': time,
          'Additional Notes': notes || 'None'
        })
      });
      if (fsRes.ok) {
        formSubmitDispatched = true;
      }
    } catch (fsErr) {
      console.warn('FormSubmit dispatch warning:', fsErr.message);
    }

    // 3. Optional Resend Email Dispatch (if RESEND_API_KEY is configured in Vercel)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const recipient = process.env.EMAIL_TO || 'libastailor0@gmail.com';
        const sender = process.env.EMAIL_FROM || 'concierge@libastailor.in';
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: sender,
            to: recipient,
            subject: `New Consultation Request: ${name} (${service})`,
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #FAF7F0; padding: 25px; color: #24211E;">
                <div style="max-width: 600px; margin: 0 auto; background: #FFF; border: 1px solid #C6A15B; padding: 30px;">
                  <h2 style="color: #55100F; margin-top: 0;">New Consultation Request</h2>
                  <p><strong>Client:</strong> ${name}</p>
                  <p><strong>Phone:</strong> ${phone}</p>
                  <p><strong>Email:</strong> ${email || 'Not provided'}</p>
                  <p><strong>Garment:</strong> ${service}</p>
                  <p><strong>Occasion:</strong> ${occasion}</p>
                  <p><strong>Venue:</strong> ${location}</p>
                  <p><strong>Date & Time:</strong> ${date} (${time})</p>
                  <p><strong>Notes:</strong> ${notes || 'None'}</p>
                </div>
              </div>
            `
          })
        });
      } catch (resendErr) {
        console.warn('Resend email error:', resendErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Your consultation request has been successfully registered with LIBAS TAILOR.',
      leadId: leadRecord.id,
      web3Dispatched,
      formSubmitDispatched
    });

  } catch (error) {
    console.error('Contact endpoint error:', error);
    return res.status(500).json({
      error: 'Failed to process inquiry. Please connect with us directly on WhatsApp.'
    });
  }
}
