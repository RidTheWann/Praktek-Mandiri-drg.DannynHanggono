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

    // Gender distribution
    const gender = { male: 0, female: 0 };
    entries.forEach(entry => {
      if (entry.gender && entry.gender.toLowerCase().includes('laki')) gender.male++;
      else if (entry.gender && entry.gender.toLowerCase().includes('perempuan')) gender.female++;
    });

    // Payment type distribution
    const paymentTypes = { bpjs: 0, umum: 0 };
    entries.forEach(entry => {
      if (entry.paymentType && entry.paymentType.toUpperCase() === 'BPJS') paymentTypes.bpjs++;
      else if (entry.paymentType && entry.paymentType.toUpperCase() === 'UMUM') paymentTypes.umum++;
    });

    // Action distribution
    const actionDistribution = {};
    entries.forEach(entry => {
      if (Array.isArray(entry.actions)) {
        entry.actions.forEach(action => {
          actionDistribution[action] = (actionDistribution[action] || 0) + 1;
        });
      }
    });

    // Traffic data (by date, gender)
    const trafficDataMap = {};
    entries.forEach(entry => {
      if (!entry.date) return;
      if (!trafficDataMap[entry.date]) trafficDataMap[entry.date] = { date: entry.date, male: 0, female: 0 };
      if (entry.gender && entry.gender.toLowerCase().includes('laki')) trafficDataMap[entry.date].male++;
      else if (entry.gender && entry.gender.toLowerCase().includes('perempuan')) trafficDataMap[entry.date].female++;
    });
    const trafficData = Object.values(trafficDataMap).sort((a, b) => a.date.localeCompare(b.date));

    // Daily average
    const uniqueDays = Object.keys(trafficDataMap).length;
    const dailyAverage = uniqueDays > 0 ? Math.round(totalPatients / uniqueDays) : 0;

    // Metadata
    const metadata = {
      uniqueDays,
      lastUpdated: new Date().toISOString()
    };

    return res.json({
      gender,
      totalPatients,
      paymentTypes,
      bpjsCount: paymentTypes.bpjs,
      umumCount: paymentTypes.umum,
      dailyAverage,
      trafficData,
      actionDistribution,
      metadata
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