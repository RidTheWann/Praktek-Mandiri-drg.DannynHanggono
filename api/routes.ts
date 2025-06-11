import { Express } from 'express';

export function registerRoutes(app: Express) {
    // Placeholder routes to prevent errors
    app.get('/api/daily-visits', (req, res) => {
        res.json({ message: 'daily-visits endpoint' });
    });
    app.get('/api/data-entries', (req, res) => {
        res.json({ message: 'data-entries endpoint' });
    });
    app.get('/api/statistics', (req, res) => {
        res.json({ message: 'statistics endpoint' });
    });
}
