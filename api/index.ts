import { NextApiRequest, NextApiResponse } from 'next';

// Simple health check endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: 'ok', message: 'API is running' });
}