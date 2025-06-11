import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export var dataEntries = pgTable("data_entries", {
    id: serial("id").primaryKey(),
    date: text("date").notNull(),
    patientName: text("patient_name").notNull(),
    medicalRecordNumber: text("medical_record_number").notNull(),
    gender: text("gender").notNull(),
    paymentType: text("payment_type").notNull(),
    actions: jsonb("actions").$type().notNull().default([]),
    otherActions: text("other_actions"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export var insertDataEntrySchema = createInsertSchema(dataEntries).omit({
    id: true,
    createdAt: true,
}).extend({
    actions: z.array(z.string()).default([]),
    patientName: z.string().min(1, "Nama pasien harus diisi"),
    medicalRecordNumber: z.string().min(1, "No. RM harus diisi"),
    gender: z.enum(["Laki-laki", "Perempuan"], { required_error: "Pilih jenis kelamin" }),
    paymentType: z.enum(["BPJS", "UMUM"], { required_error: "Pilih jenis pembayaran" }),
});
export var users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});
export var insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});
