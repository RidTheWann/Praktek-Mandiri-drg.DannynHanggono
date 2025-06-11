import { storage } from "./storage";

export default async function handler(req: any, res: any) {
  try {
    const entries = await storage.getDataEntries();
    res.json(entries);
  } catch (err: any) {
    console.error("[data-entries] API error:", err);
    res.status(500).json({ error: 'Internal Server Error', details: err?.message || err, stack: err?.stack });
  }
}
