import { storage } from './storage.js';
import type { Request, Response } from 'express';
import { z } from 'zod';

const entryQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().transform(Number).optional()
});

export default async function handler(req: Request, res: Response) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const query = entryQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ 
        error: "Invalid query parameters",
        details: query.error.format()
      });
    }

    const { startDate, endDate } = query.data;
    
    if (startDate && endDate) {
      const entries = await storage.getDataEntriesByDateRange(startDate, endDate);
      return res.json(entries);
    }

    const entries = await storage.getDataEntries();
    return res.json(entries);
  } catch (err: any) {
    console.error("[data-entries] API error:", {
      message: err?.message,
      stack: err?.stack,
      query: req.query,
      time: new Date().toISOString()
    });
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: err?.message || String(err)
    });
  }
}
