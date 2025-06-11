import { storage } from "./storage";

export default async function handler(req: any, res: any) {
  try {
    // Mendukung filter berdasarkan tanggal jika ada query date
    if (req.method === "GET") {
      if (req.query && req.query.date) {
        // Jika ada query date, ambil data untuk tanggal tersebut saja
        const entries = await storage.getDataEntriesByDateRange(req.query.date, req.query.date);
        res.json(entries);
      } else {
        // Jika tidak ada query date, ambil semua data
        const entries = await storage.getDataEntries();
        res.json(entries);
      }
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (err: any) {
    console.error("[daily-visits] API error:", err);
    res.status(500).json({ error: 'Internal Server Error', details: err?.message || err, stack: err?.stack });
  }
}
