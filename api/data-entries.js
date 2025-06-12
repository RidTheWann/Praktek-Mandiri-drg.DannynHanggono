import { combinedStorage } from './combined.js';
import { insertDataEntrySchema } from './schema.js';
import { z } from 'zod';

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  name: z.string().optional(),
  medicalRecord: z.string().optional(),
  action: z.string().optional()
});

// Enable CORS middleware
function enableCors(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS method for preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

export default async function handler(req, res) {
  try {
    // Handle CORS preflight
    if (enableCors(req, res)) {
      return;
    }
    
    // GET - Retrieve entries
    if (req.method === "GET") {
      const query = querySchema.safeParse(req.query);
      if (!query.success) {
        return res.status(400).json({ error: "Invalid query parameters" });
      }
      let entries = [];
      if (query.data.startDate && query.data.endDate) {
        entries = await combinedStorage.getDataEntriesByDateRange(
          query.data.startDate, 
          query.data.endDate
        );
      } else {
        entries = await combinedStorage.getDataEntries();
      }
      // Filter by name, medicalRecord, action
      if (query.data.name) {
        entries = entries.filter(e => e.patientName && e.patientName.toLowerCase().includes(query.data.name.toLowerCase()));
      }
      if (query.data.medicalRecord) {
        entries = entries.filter(e => e.medicalRecordNumber && e.medicalRecordNumber.toLowerCase().includes(query.data.medicalRecord.toLowerCase()));
      }
      if (query.data.action) {
        entries = entries.filter(e => Array.isArray(e.actions) && e.actions.includes(query.data.action));
      }
      return res.json(entries);
    }
    
    // POST - Create new entry
    if (req.method === "POST") {
      const result = insertDataEntrySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: result.error.format() 
        });
      }
      
      const newEntry = await combinedStorage.createDataEntry(result.data);
      return res.status(201).json(newEntry);
    }
    
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err) {
    console.error("[data-entries] API error:", {
      message: err?.message,
      stack: err?.stack,
      query: req.query,
      body: req.body,
      method: req.method,
      time: new Date().toISOString()
    });
    
    return res.status(500).json({
      error: 'Internal Server Error',
      details: err?.message || String(err)
    });
  }
}