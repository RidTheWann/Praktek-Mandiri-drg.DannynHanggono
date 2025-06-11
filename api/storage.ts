import { type User, type InsertUser, type DataEntry, type InsertDataEntry } from "../shared/schema";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createDataEntry(entry: InsertDataEntry): Promise<DataEntry>;
  getDataEntries(): Promise<DataEntry[]>;
  getDataEntryById(id: number): Promise<DataEntry | undefined>;
  getDataEntriesByDateRange(startDate: string, endDate: string): Promise<DataEntry[]>;
  updateDataEntry(id: number, entry: Partial<InsertDataEntry>): Promise<DataEntry | undefined>;
  deleteDataEntry(id: number): Promise<boolean>;
}

class PostgresStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in getUser:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
        [insertUser.username, insertUser.password]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }

  async createDataEntry(insertEntry: InsertDataEntry): Promise<DataEntry> {
    try {
      const result = await pool.query(
        `INSERT INTO data_entries (
          date, patient_name, medical_record_number, gender, payment_type, actions, other_actions, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          insertEntry.date,
          insertEntry.patientName,
          insertEntry.medicalRecordNumber,
          insertEntry.gender,
          insertEntry.paymentType,
          JSON.stringify(insertEntry.actions || []),
          insertEntry.otherActions || null,
          insertEntry.description || null
        ]
      );
      return this.mapDataEntryFromDb(result.rows[0]);
    } catch (error) {
      console.error("Error in createDataEntry:", error);
      throw error;
    }
  }

  async getDataEntries(): Promise<DataEntry[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM data_entries ORDER BY created_at DESC'
      );
      return result.rows.map(this.mapDataEntryFromDb);
    } catch (error) {
      console.error("Error in getDataEntries:", error);
      return [];
    }
  }

  async getDataEntryById(id: number): Promise<DataEntry | undefined> {
    try {
      const result = await pool.query(
        'SELECT * FROM data_entries WHERE id = $1',
        [id]
      );
      return result.rows.length ? this.mapDataEntryFromDb(result.rows[0]) : undefined;
    } catch (error) {
      console.error("Error in getDataEntryById:", error);
      return undefined;
    }
  }

  async getDataEntriesByDateRange(startDate: string, endDate: string): Promise<DataEntry[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM data_entries WHERE date >= $1 AND date <= $2 ORDER BY created_at DESC',
        [startDate, endDate]
      );
      return result.rows.map(this.mapDataEntryFromDb);
    } catch (error) {
      console.error("Error in getDataEntriesByDateRange:", error);
      return [];
    }
  }

  async updateDataEntry(id: number, updateData: Partial<InsertDataEntry>): Promise<DataEntry | undefined> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateData.date !== undefined) {
        updates.push(`date = $${paramIndex}`);
        values.push(updateData.date);
        paramIndex++;
      }
      if (updateData.patientName !== undefined) {
        updates.push(`patient_name = $${paramIndex}`);
        values.push(updateData.patientName);
        paramIndex++;
      }
      if (updateData.medicalRecordNumber !== undefined) {
        updates.push(`medical_record_number = $${paramIndex}`);
        values.push(updateData.medicalRecordNumber);
        paramIndex++;
      }
      if (updateData.gender !== undefined) {
        updates.push(`gender = $${paramIndex}`);
        values.push(updateData.gender);
        paramIndex++;
      }
      if (updateData.paymentType !== undefined) {
        updates.push(`payment_type = $${paramIndex}`);
        values.push(updateData.paymentType);
        paramIndex++;
      }
      if (updateData.actions !== undefined) {
        updates.push(`actions = $${paramIndex}`);
        values.push(JSON.stringify(updateData.actions));
        paramIndex++;
      }
      if (updateData.otherActions !== undefined) {
        updates.push(`other_actions = $${paramIndex}`);
        values.push(updateData.otherActions);
        paramIndex++;
      }
      if (updateData.description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        values.push(updateData.description);
        paramIndex++;
      }
      if (updates.length === 0) {
        return await this.getDataEntryById(id);
      }
      values.push(id);
      const result = await pool.query(
        `UPDATE data_entries SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      return result.rows.length ? this.mapDataEntryFromDb(result.rows[0]) : undefined;
    } catch (error) {
      console.error("Error in updateDataEntry:", error);
      return undefined;
    }
  }

  async deleteDataEntry(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM data_entries WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error in deleteDataEntry:", error);
      return false;
    }
  }

  private mapDataEntryFromDb(row: any): DataEntry {
    return {
      id: row.id,
      date: row.date,
      patientName: row.patient_name,
      medicalRecordNumber: row.medical_record_number,
      gender: row.gender,
      paymentType: row.payment_type,
      actions: Array.isArray(row.actions) ? row.actions : JSON.parse(row.actions || '[]'),
      otherActions: row.other_actions,
      description: row.description,
      createdAt: row.created_at
    };
  }
}

export const storage = new PostgresStorage();
