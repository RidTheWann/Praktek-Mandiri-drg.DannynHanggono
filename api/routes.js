"use strict";
// This file is no longer used for Vercel deployment. All API endpoints are now in their own files.
// import { Express } from 'express';
// export function registerRoutes(app: Express) {
//     // Placeholder routes to prevent errors
//     app.get('/api/daily-visits', (req, res) => {
//         try {
//             // Log query for debugging
//             console.log('GET /api/daily-visits', req.query);
//             res.json({ message: 'daily-visits endpoint', query: req.query });
//         } catch (err) {
//             res.status(500).json({ error: 'Internal Server Error', details: err });
//         }
//     });
//     app.get('/api/data-entries', (req, res) => {
//         try {
//             console.log('GET /api/data-entries');
//             res.json({ message: 'data-entries endpoint' });
//         } catch (err) {
//             res.status(500).json({ error: 'Internal Server Error', details: err });
//         }
//     });
//     app.get('/api/statistics', (req, res) => {
//         try {
//             console.log('GET /api/statistics');
//             res.json({ message: 'statistics endpoint' });
//         } catch (err) {
//             res.status(500).json({ error: 'Internal Server Error', details: err });
//         }
//     });
//     // Global error handler (optional, for catching unhandled errors)
//     app.use((err: any, req: any, res: any, next: any) => {
//         console.error('Global error handler:', err);
//         res.status(500).json({ error: 'Internal Server Error', details: err?.message || err });
//     });
// }
