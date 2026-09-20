/**
 * LIBAS TAILOR — Serverless Lead Capture Endpoint
 * 
 * Stores leads gathered by the LIBAS AI Concierge.
 * Persists locally to data/leads.json and notifies the atelier via Web3Forms.
 */

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Return leads count or health status
    return res.status(200).json({ status: 'active', service: 'LIBAS Lead Capture' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body || {};

    if (!data.name || !data.phone) {
      return res.status(400).json({
        error: 'Missing required fields. Name and phone are required to register an atelier inquiry.'
      });
    }

    const leadRecord = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: String(data.name).trim(),
      phone: String(data.phone).trim(),
      email: data.email ? String(data.email).trim() : '',
      service: data.service ? String(data.service).trim() : 'Bespoke Inquiry',
      occasion: data.occasion ? String(data.occasion).trim() : '',
      consultationType: data.consultationType ? String(data.consultationType).trim() : 'Atelier Consultation',
      preferredDate: data.preferredDate || '',
      preferredTime: data.preferredTime || '',
      notes: data.notes ? String(data.notes).trim() : '',
      source: 'LIBAS AI Concierge',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // 1. Persist to local JSON file
    try {
      const dataDir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const leadsFilePath = path.join(dataDir, 'leads.json');
      let existingLeads = [];
      if (fs.existsSync(leadsFilePath)) {
        try {
          const raw = fs.readFileSync(leadsFilePath, 'utf-8');
          existingLeads = JSON.parse(raw);
          if (!Array.isArray(existingLeads)) existingLeads = [];
        } catch {
          existingLeads = [];
        }
      }
      existingLeads.push(leadRecord);
      fs.writeFileSync(leadsFilePath, JSON.stringify(existingLeads, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('Lead file persistence warning:', fsErr.message);
    }

    // 2. Dispatch background email notification via Web3Forms
    try {
      const web3Data = new FormData();
      web3Data.append("access_key", "7097fd8c-680d-4e0a-86d8-0d53621e4b47");
      web3Data.append("subject", `New Qualified Lead (AI Concierge): ${leadRecord.name} (${leadRecord.service})`);
      web3Data.append("from_name", "LIBAS AI Concierge");
      web3Data.append("name", leadRecord.name);
      web3Data.append("phone", leadRecord.phone);
      if (leadRecord.email) web3Data.append("email", leadRecord.email);
      web3Data.append("service", leadRecord.service);
      web3Data.append("occasion", leadRecord.occasion);
      web3Data.append("consultation_type", leadRecord.consultationType);
      web3Data.append("preferred_date", leadRecord.preferredDate);
      web3Data.append("preferred_time", leadRecord.preferredTime);
      web3Data.append("notes", leadRecord.notes);
      web3Data.append("source", leadRecord.source);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: web3Data
      }).catch(web3Err => console.warn('Web3Forms lead dispatch warning:', web3Err.message));
    } catch (dispatchErr) {
      console.warn('Lead notification dispatch warning:', dispatchErr.message);
    }

    // 3. FormSubmit Failover Email to Atelier Inbox
    try {
      const recipient = process.env.EMAIL_TO || 'libastailor0@gmail.com';
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://libastailor.in',
          'Referer': 'https://libastailor.in/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          _subject: `New Lead from AI Concierge: ${leadRecord.name} (${leadRecord.service})`,
          _template: 'table',
          'Lead Name': leadRecord.name,
          'Phone / WhatsApp': leadRecord.phone,
          'Email': leadRecord.email || 'Not provided',
          'Garment Silhouette': leadRecord.service,
          'Occasion': leadRecord.occasion || 'General Inquiry',
          'Consultation Venue': leadRecord.consultationType,
          'Preferred Date': leadRecord.preferredDate || 'Not specified',
          'Preferred Time': leadRecord.preferredTime || 'Not specified',
          'Atelier Notes': leadRecord.notes || 'None',
          'Source': 'LIBAS AI Concierge'
        })
      });
    } catch (fsErr) {
      console.warn('FormSubmit lead notice:', fsErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Consultation request submitted successfully.',
      leadId: leadRecord.id
    });

  } catch (error) {
    console.error('Lead processing error:', error);
    return res.status(500).json({ error: 'Failed to process lead' });
  }
}
