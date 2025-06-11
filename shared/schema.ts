import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dataEntries = pgTable("data_entries", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  patientName: text("patient_name").notNull(),
  medicalRecordNumber: text("medical_record_number").notNull(),
  gender: text("gender").notNull(),
  paymentType: text("payment_type").notNull(),
  actions: jsonb("actions").$type<string[]>().notNull().default([]),
  otherActions: text("other_actions"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDataEntrySchema = createInsertSchema(dataEntries).omit({
  id: true,
  createdAt: true,
}).extend({
  actions: z.array(z.string()).default([]),
  patientName: z.string().min(1, "Nama pasien harus diisi"),
  medicalRecordNumber: z.string().min(1, "No. RM harus diisi"),
  gender: z.enum(["Laki-laki", "Perempuan"], { required_error: "Pilih jenis kelamin" }),
  paymentType: z.enum(["BPJS", "UMUM"], { required_error: "Pilih jenis pembayaran" }),
});

export type InsertDataEntry = z.infer<typeof insertDataEntrySchema>;
export type DataEntry = typeof dataEntries.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
