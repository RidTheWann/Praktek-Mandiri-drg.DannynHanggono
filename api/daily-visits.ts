export default function handler(req: any, res: any) {
  try {
    // Log query for debugging
    console.log('GET /api/daily-visits', req.query);
    res.json({ message: 'daily-visits endpoint', query: req.query });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', details: err?.message || err });
  }
}
