import type { Express } from "express";
import { storage } from "../server/storage";
import { insertDataEntrySchema } from "./schema";
import { z } from "zod";

export function registerRoutes(app: Express): void {
  // Data Entries Routes
  app.post("/api/data-entries", async (req, res) => {
    try {
      const validatedData = insertDataEntrySchema.parse(req.body);
      const entry = await storage.createDataEntry(validatedData);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  // ...existing code dari server/routes.ts, tanpa return httpServer...
}
