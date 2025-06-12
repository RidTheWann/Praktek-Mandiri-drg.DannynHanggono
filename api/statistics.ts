import { NextApiRequest, NextApiResponse } from 'next';
import { combinedStorage } from './combined';

// Enable CORS middleware
function enableCors(req: NextApiRequest, res: NextApiResponse) {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Handle CORS preflight
    if (enableCors(req, res)) {
      return;
    }
    
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    
    const entries = await combinedStorage.getDataEntries();
    
    // Initialize action distribution tracking
    const actionDistribution: Record<string, number> = {};
    
    const statistics = {
      gender: {
        male: entries.filter(e => e.gender?.toLowerCase() === "laki-laki").length,
        female: entries.filter(e => e.gender?.toLowerCase() === "perempuan").length
      },
      total: entries.length,
      paymentType: {
        bpjs: entries.filter(e => e.paymentType === "BPJS").length,
        umum: entries.filter(e => e.paymentType === "UMUM").length
      },
      dailyStats: {} as Record<string, number>
    };
    
    // Calculate daily statistics and action distribution
    entries.forEach(e => {
      if (e.date) {
        statistics.dailyStats[e.date] = (statistics.dailyStats[e.date] || 0) + 1;
        
        // Track gender distribution by date for traffic chart
        if (!statistics.dailyStats[e.date + '_male']) {
          statistics.dailyStats[e.date + '_male'] = 0;
        }
        if (!statistics.dailyStats[e.date + '_female']) {
          statistics.dailyStats[e.date + '_female'] = 0;
        }
        
        if (e.gender && e.gender.toLowerCase() === 'laki-laki') {
          statistics.dailyStats[e.date + '_male']++;
        } else if (e.gender && e.gender.toLowerCase() === 'perempuan') {
          statistics.dailyStats[e.date + '_female']++;
        }
        
        // Track action distribution
        if (Array.isArray(e.actions)) {
          e.actions.forEach(action => {
            actionDistribution[action] = (actionDistribution[action] || 0) + 1;
          });
        }
      }
    });
    
    const uniqueDays = Object.keys(statistics.dailyStats).filter(key => !key.includes('_')).length;
    const dailyAverage = uniqueDays > 0 ? Math.round(entries.length / uniqueDays) : 0;
    
    // Process traffic data with gender breakdown
    const trafficData = Object.keys(statistics.dailyStats)
      .filter(key => !key.includes('_')) // Filter out the gender-specific keys
      .map(date => {
        return {
          date,
          count: statistics.dailyStats[date],
          male: statistics.dailyStats[date + '_male'] || 0,
          female: statistics.dailyStats[date + '_female'] || 0
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return res.json({
      gender: statistics.gender,
      totalPatients: statistics.total,
      paymentTypes: statistics.paymentType,
      bpjsCount: statistics.paymentType.bpjs,
      umumCount: statistics.paymentType.umum,
      dailyAverage,
      trafficData,
      actionDistribution,
      metadata: {
        uniqueDays,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error("[statistics] API error:", {
      message: err?.message,
      stack: err?.stack,
      time: new Date().toISOString()
    });
    
    return res.status(500).json({
      error: 'Internal Server Error',
      details: err?.message || String(err)
    });
  }
}