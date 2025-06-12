import { Pool } from 'pg';

// Initialize PostgreSQL connection pool with SSL for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database by creating tables if they don't exist
export async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS data_entries (
        id BIGINT PRIMARY KEY,
        date DATE NOT NULL,
        patient_name TEXT NOT NULL,
        medical_record_number TEXT NOT NULL,
        gender TEXT NOT NULL,
        payment_type TEXT NOT NULL,
        actions TEXT[] NOT NULL,
        other_actions TEXT,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Get all entries from database
export async function getAllEntries() {
  try {
    const result = await pool.query(`
      SELECT * FROM data_entries
      ORDER BY date DESC
    `);
    return result.rows.map(row => ({
      id: row.id,
      date: row.date ? row.date.toISOString().split('T')[0] : null,
      patientName: row.patient_name,
      medicalRecordNumber: row.medical_record_number,
      gender: row.gender,
      paymentType: row.payment_type,
      actions: row.actions,
      otherActions: row.other_actions || '',
      description: row.description || '',
      createdAt: row.created_at ? row.created_at.toISOString() : null
    }));
  } catch (error) {
    console.error('Error getting entries:', error);
    return [];
  }
}

// Get entries by date range
export async function getEntriesByDateRange(startDate, endDate) {
  try {
    const result = await pool.query(`
      SELECT * FROM data_entries
      WHERE date >= $1 AND date <= $2
      ORDER BY date DESC
    `, [startDate, endDate]);
    
    return result.rows.map(row => ({
      id: row.id,
      date: row.date ? row.date.toISOString().split('T')[0] : null,
      patientName: row.patient_name,
      medicalRecordNumber: row.medical_record_number,
      gender: row.gender,
      paymentType: row.payment_type,
      actions: row.actions,
      otherActions: row.other_actions || '',
      description: row.description || '',
      createdAt: row.created_at ? row.created_at.toISOString() : null
    }));
  } catch (error) {
    console.error('Error getting entries by date range:', error);
    return [];
  }
}

// Add new entry
export async function addEntry(entry) {
  try {
    const id = Date.now();
    const result = await pool.query(`
      INSERT INTO data_entries (
        id, date, patient_name, medical_record_number, 
        gender, payment_type, actions, other_actions, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      id,
      entry.date,
      entry.patientName,
      entry.medicalRecordNumber,
      entry.gender,
      entry.paymentType,
      entry.actions,
      entry.otherActions || '',
      entry.description || ''
    ]);
    
    const row = result.rows[0];
    return {
      id: row.id,
      date: row.date ? row.date.toISOString().split('T')[0] : null,
      patientName: row.patient_name,
      medicalRecordNumber: row.medical_record_number,
      gender: row.gender,
      paymentType: row.payment_type,
      actions: row.actions,
      otherActions: row.other_actions || '',
      description: row.description || '',
      createdAt: row.created_at ? row.created_at.toISOString() : null
    };
  } catch (error) {
    console.error('Error adding entry:', error);
    throw error;
  }
}

// Update existing entry
export async function updateEntry(id, entry) {
  try {
    const result = await pool.query(`
      UPDATE data_entries
      SET 
        date = $1,
        patient_name = $2,
        medical_record_number = $3,
        gender = $4,
        payment_type = $5,
        actions = $6,
        other_actions = $7,
        description = $8
      WHERE id = $9
      RETURNING *
    `, [
      entry.date,
      entry.patientName,
      entry.medicalRecordNumber,
      entry.gender,
      entry.paymentType,
      entry.actions,
      entry.otherActions || '',
      entry.description || '',
      id
    ]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      date: row.date ? row.date.toISOString().split('T')[0] : null,
      patientName: row.patient_name,
      medicalRecordNumber: row.medical_record_number,
      gender: row.gender,
      paymentType: row.payment_type,
      actions: row.actions,
      otherActions: row.other_actions || '',
      description: row.description || '',
      createdAt: row.created_at ? row.created_at.toISOString() : null
    };
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
}

// Delete entry
export async function deleteEntry(id) {
  try {
    const result = await pool.query(`
      DELETE FROM data_entries
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      date: row.date ? row.date.toISOString().split('T')[0] : null,
      patientName: row.patient_name,
      medicalRecordNumber: row.medical_record_number,
      gender: row.gender,
      paymentType: row.payment_type,
      actions: row.actions,
      otherActions: row.other_actions || '',
      description: row.description || '',
      createdAt: row.created_at ? row.created_at.toISOString() : null
    };
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
}