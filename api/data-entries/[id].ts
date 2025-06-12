import { NextApiRequest, NextApiResponse } from 'next';
import { combinedStorage } from '../combined';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
    body
  } = req;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'ID is required and must be a string' });
  }

  switch (method) {
    case 'PUT': {
      try {
        const updatedEntry = await combinedStorage.updateDataEntry(Number(id), body);
        if (!updatedEntry) {
          return res.status(404).json({ error: 'Entry not found' });
        }
        return res.status(200).json(updatedEntry);
      } catch (err: any) {
        return res.status(500).json({ error: err?.message || 'Internal Server Error' });
      }
    }
    case 'DELETE': {
      try {
        const deletedEntry = await combinedStorage.deleteDataEntry(Number(id));
        if (!deletedEntry) {
          return res.status(404).json({ error: 'Entry not found' });
        }
        return res.status(200).json(deletedEntry);
      } catch (err: any) {
        return res.status(500).json({ error: err?.message || 'Internal Server Error' });
      }
    }
    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
