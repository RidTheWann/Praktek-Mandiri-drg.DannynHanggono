export default function handler(req: any, res: any) {
  try {
    console.log('GET /api/statistics');
    res.json({ message: 'statistics endpoint' });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', details: err?.message || err });
  }
}
