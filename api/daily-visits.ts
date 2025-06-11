import { storage } from './storage.js';
import { z } from 'zod';
import type { Request, Response } from 'express';

const querySchema = z.object({
  date: z.string().optional()
});

export default async function handler(req: Request, res: Response) {
  try {
    if (req.method === "GET") {
      const query = querySchema.safeParse(req.query);
      
      if (!query.success) {
        return res.status(400).json({ error: "Invalid query parameters" });
      }

      if (query.data.date) {
        const entries = await storage.getDataEntriesByDateRange(query.data.date, query.data.date);
        return res.json(entries);
      } else {
        const entries = await storage.getDataEntries();
        return res.json(entries);
      }
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("[daily-visits] API error:", {
      message: err?.message,
      stack: err?.stack,
      query: req.query
    });
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: err?.message || String(err)
    });
  }
}
