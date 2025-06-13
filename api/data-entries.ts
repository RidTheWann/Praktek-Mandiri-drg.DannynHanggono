import { NextApiRequest, NextApiResponse } from 'next';
import { combinedStorage } from './combined';
import { z } from 'zod';

const entryQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  id: z.string().optional()
});

// Enable CORS middleware
function enableCors(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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

    // Extract id from either query or path
    let id: number | undefined = undefined;
    if (req.query.id) {
      id = parseInt(req.query.id as string);
    } else if (req.url) {
      const match = req.url.match(/\/api\/data-entries\/?(\d+)$/);
      if (match) {
        id = parseInt(match[1]);
      }
    }

    if (req.method === "POST") {
      // Handle POST request to add new entry
      const newEntry = await combinedStorage.addDataEntry(req.body);
      return res.status(201).json(newEntry);
    }

    if (req.method === "PUT") {
      // Handle PUT request to update an entry
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      const updatedEntry = await combinedStorage.updateDataEntry(id, req.body);
      if (!updatedEntry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      return res.status(200).json(updatedEntry);
    }

    if (req.method === "DELETE") {
      // Handle DELETE request to remove an entry
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      const deletedEntry = await combinedStorage.deleteDataEntry(id);
      if (!deletedEntry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      return res.status(200).json(deletedEntry);
    }

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
      const entries = await combinedStorage.getDataEntriesByDateRange(startDate, endDate);
      return res.json(entries);
    } else {
      const entries = await combinedStorage.getDataEntries();
      return res.json(entries);
    }
  } catch (err: any) {
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