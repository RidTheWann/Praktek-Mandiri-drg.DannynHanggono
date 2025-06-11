import { storage } from './storage.js';
import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Fetch all data entries
    const entries = await storage.getDataEntries();

    // Calculate statistics with null checks
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

    // Calculate daily statistics
    entries.forEach(e => {
      if (e.date) {
        statistics.dailyStats[e.date] = (statistics.dailyStats[e.date] || 0) + 1;
      }
    });

    const uniqueDays = Object.keys(statistics.dailyStats).length;
    const dailyAverage = uniqueDays > 0 ? Math.round(entries.length / uniqueDays) : 0;

    // Traffic data (by date)
    const trafficData = Object.entries(statistics.dailyStats)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.json({
      gender: statistics.gender,
      totalPatients: statistics.total,
      paymentTypes: statistics.paymentType,
      dailyAverage,
      trafficData,
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
