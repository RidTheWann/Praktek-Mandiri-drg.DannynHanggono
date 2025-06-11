import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDataEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.get("/api/data-entries", async (req, res) => {
    try {
      const { startDate, endDate, name, medicalRecord, action } = req.query;

      // Jika ada parameter pencarian khusus
      if (name || medicalRecord || action) {
        const entries = await storage.getDataEntries();
        let filteredEntries = entries;
        
        // Filter berdasarkan nama
        if (name) {
          const searchTerm = (name as string).toLowerCase();
          filteredEntries = filteredEntries.filter(entry => 
            entry.patientName.toLowerCase().includes(searchTerm)
          );
        }
        
        // Filter berdasarkan nomor rekam medis
        if (medicalRecord) {
          const searchTerm = (medicalRecord as string).toLowerCase();
          filteredEntries = filteredEntries.filter(entry => 
            entry.medicalRecordNumber.toLowerCase().includes(searchTerm)
          );
        }
        
        // Filter berdasarkan tindakan
        if (action) {
          const searchTerm = (action as string).toLowerCase();
          filteredEntries = filteredEntries.filter(entry => {
            // Cek di array actions
            const actionsMatch = entry.actions.some(act => 
              act.toLowerCase().includes(searchTerm)
            );
            
            // Cek di otherActions
            const otherActionsMatch = entry.otherActions ? 
              entry.otherActions.toLowerCase().includes(searchTerm) : false;
              
            return actionsMatch || otherActionsMatch;
          });
        }
        
        return res.json(filteredEntries);
      }
      
      // Jika ada parameter rentang tanggal
      if (startDate && endDate) {
        const entries = await storage.getDataEntriesByDateRange(
          startDate as string,
          endDate as string
        );
        res.json(entries);
      } else {
        const entries = await storage.getDataEntries();
        res.json(entries);
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/data-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getDataEntryById(id);

      if (!entry) {
        res.status(404).json({ message: "Data entry not found" });
        return;
      }

      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/data-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDataEntrySchema.partial().parse(req.body);
      const updatedEntry = await storage.updateDataEntry(id, validatedData);

      if (!updatedEntry) {
        res.status(404).json({ message: "Data entry not found" });
        return;
      }

      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/data-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDataEntry(id);

      if (!deleted) {
        res.status(404).json({ message: "Data entry not found" });
        return;
      }

      res.json({ message: "Data entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Daily visits endpoint
  app.get("/api/daily-visits", async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const dailyEntries = await storage.getDataEntriesByDateRange(
        targetDate as string,
        targetDate as string
      );

      res.json(dailyEntries);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Statistics endpoint
  app.get("/api/statistics", async (req, res) => {
    try {
      const entries = await storage.getDataEntries();
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Gender statistics per month
      const monthEntries = entries.filter(entry => entry.date >= thisMonth);
      const maleCount = monthEntries.filter(entry => entry.gender && entry.gender.trim().toLowerCase() === 'laki-laki').length;
      const femaleCount = monthEntries.filter(entry => entry.gender && entry.gender.trim().toLowerCase() === 'perempuan').length;

      // Daily visits average
      const uniqueDates = Array.from(new Set(entries.map(entry => entry.date)));
      const dailyAverage = uniqueDates.length > 0 ? Math.round(entries.length / uniqueDates.length) : 0;

      // Payment type statistics
      const bpjsCount = entries.filter(entry => entry.paymentType === 'BPJS').length;
      const umumCount = entries.filter(entry => entry.paymentType === 'UMUM').length;

      // Total patients
      const totalPatients = entries.length;

      // Traffic data by gender over time
      const trafficData: { date: string; male: number; female: number }[] = [];
      const dateGroups = entries.reduce((acc, entry) => {
        const date = entry.date;
        if (!acc[date]) {
          acc[date] = { date, male: 0, female: 0 };
        }
        
        // Perbaikan: Pastikan pengecekan gender yang tepat untuk semua format
        if (entry.gender && entry.gender.trim().toLowerCase() === 'laki-laki') {
          acc[date].male += 1;
        } else if (entry.gender && entry.gender.trim().toLowerCase() === 'perempuan') {
          acc[date].female += 1;
        }
        
        return acc;
      }, {} as Record<string, { date: string; male: number; female: number }>);

      Object.values(dateGroups)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .forEach(data => trafficData.push(data));

      const actionCounts = entries.reduce((acc, entry) => {
        entry.actions.forEach(action => {
          acc[action] = (acc[action] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      res.json({
        maleMonthly: maleCount,
        femaleMonthly: femaleCount,
        dailyAverage,
        bpjsCount,
        umumCount,
        totalPatients,
        trafficData,
        actionDistribution: actionCounts
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}