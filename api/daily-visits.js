import { combinedStorage } from './combined.js';
import { z } from 'zod';

const querySchema = z.object({
  date: z.string().optional()
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
    
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    
    const query = querySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }
    
    if (query.data.date) {
      const entries = await combinedStorage.getDataEntriesByDateRange(query.data.date, query.data.date);
      return res.json(entries);
    } else {
      const entries = await combinedStorage.getDataEntries();
      return res.json(entries);
    }
  } catch (err) {
    console.error("[daily-visits] API error:", {
      message: err?.message,
      stack: err?.stack,
      query: req.query,
      method: req.method,
      time: new Date().toISOString()
    });
    
    return res.status(500).json({
      error: 'Internal Server Error',
      details: err?.message || String(err)
    });
  }
}