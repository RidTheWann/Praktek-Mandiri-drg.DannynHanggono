// Vercel API handler: create and export an Express app with all routes registered
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all API routes (registerRoutes returns a Server, but we only need the app for Vercel)
registerRoutes(app);

export default app;
