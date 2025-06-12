import { combinedStorage } from './combined.js';
import { z } from 'zod';

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
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
    
    let entries;
    if (query.data.startDate && query.data.endDate) {
      entries = await combinedStorage.getDataEntriesByDateRange(
        query.data.startDate, 
        query.data.endDate
      );
    } else {
      entries = await combinedStorage.getDataEntries();
    }
    
    // Calculate statistics
    const totalPatients = entries.length;
    
    // Count by gender
    const genderCounts = entries.reduce((acc, entry) => {
      const gender = entry.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});
    
    // Count by payment type
    const paymentCounts = entries.reduce((acc, entry) => {
      const paymentType = entry.paymentType || 'Unknown';
      acc[paymentType] = (acc[paymentType] || 0) + 1;
      return acc;
    }, {});
    
    // Count by action
    const actionCounts = entries.reduce((acc, entry) => {
      if (Array.isArray(entry.actions)) {
        entry.actions.forEach(action => {
          acc[action] = (acc[action] || 0) + 1;
        });
      }
      return acc;
    }, {});
    
    // Count by date
    const dateCounts = entries.reduce((acc, entry) => {
      const date = entry.date || 'Unknown';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    return res.json({
      totalPatients,
      genderCounts,
      paymentCounts,
      actionCounts,
      dateCounts,
      timeframe: {
        startDate: query.data.startDate || 'all',
        endDate: query.data.endDate || 'all'
      }
    });
  } catch (err) {
    console.error("[statistics] API error:", {
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