import { z } from "zod";

// Define schema without using drizzle-orm/pg-core and drizzle-zod
export const dataEntrySchema = z.object({
  id: z.number().optional(),
  date: z.string(),
  patientName: z.string().min(1, "Nama pasien harus diisi"),
  medicalRecordNumber: z.string().min(1, "No. RM harus diisi"),
  gender: z.enum(["Laki-laki", "Perempuan"], { required_error: "Pilih jenis kelamin" }),
  paymentType: z.enum(["BPJS", "UMUM"], { required_error: "Pilih jenis pembayaran" }),
  actions: z.array(z.string()).default([]),
  otherActions: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.date().optional()
});

export const insertDataEntrySchema = dataEntrySchema.omit({
  id: true,
  createdAt: true
});

export const userSchema = z.object({
  id: z.number().optional(),
  username: z.string(),
  password: z.string()
});

export const insertUserSchema = userSchema.pick({
  username: true,
  password: true
});

// Type definitions for JavaScript usage
export const dataEntries = {
  tableName: "data_entries"
};

export const users = {
  tableName: "users"
};