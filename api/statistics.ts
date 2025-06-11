import { storage } from "./storage";

export default async function handler(req: any, res: any) {
  try {
    if (req.method === "GET") {
      // Ambil semua data entries
      const entries = await storage.getDataEntries();
      // Hitung statistik
      const maleMonthly = entries.filter(e => e.gender?.toLowerCase() === "laki-laki").length;
      const femaleMonthly = entries.filter(e => e.gender?.toLowerCase() === "perempuan").length;
      const totalPatients = entries.length;
      const bpjsCount = entries.filter(e => e.paymentType === "BPJS").length;
      const umumCount = entries.filter(e => e.paymentType === "UMUM").length;
      // Hitung daily average (rata-rata per hari)
      const dateMap: Record<string, number> = {};
      entries.forEach(e => {
        dateMap[e.date] = (dateMap[e.date] || 0) + 1;
      });
      const dailyAverage = Object.values(dateMap).length > 0 ? Math.round(entries.length / Object.values(dateMap).length) : 0;
      // Traffic data (per tanggal)
      const trafficData = Object.entries(dateMap).map(([date, count]) => {
        const males = entries.filter(e => e.date === date && e.gender?.toLowerCase() === "laki-laki").length;
        const females = entries.filter(e => e.date === date && e.gender?.toLowerCase() === "perempuan").length;
        return { date, male: males, female: females };
      });
      // Distribusi tindakan
      const actionDistribution: Record<string, number> = {};
      entries.forEach(e => {
        (e.actions || []).forEach(action => {
          actionDistribution[action] = (actionDistribution[action] || 0) + 1;
        });
      });
      res.json({
        maleMonthly,
        femaleMonthly,
        dailyAverage,
        bpjsCount,
        umumCount,
        totalPatients,
        trafficData,
        actionDistribution
      });
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (err: any) {
    console.error("[statistics] API error:", err);
    res.status(500).json({ error: 'Internal Server Error', details: err?.message || err, stack: err?.stack });
  }
}
