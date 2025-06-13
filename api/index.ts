// API entry point for Praktek Mandiri
// Author: drg. Danny Hanggono
// Last updated: 2025-06-13
// Professional API health check endpoint

import { NextApiRequest, NextApiResponse } from 'next';

// Simple health check endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: 'ok', message: 'API is running' });
}