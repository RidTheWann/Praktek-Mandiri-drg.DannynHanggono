import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define types for better type safety
interface DataEntry {
  id: number;
  date: string;
  patientName: string;
  medicalRecordNumber: string;
  gender: string;
  paymentType: string;
  actions: string[];
  otherActions?: string;
  description?: string;
  createdAt: string;
}

interface DataStorage {
  entries: DataEntry[];
}

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ entries: [] }));
}

// Read data from file
function readData(): DataStorage {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { entries: [] };
  }
}

// Write data to file
function writeData(data: DataStorage): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

// Format entry to ensure all fields are present
function formatEntry(entry: Partial<DataEntry>): DataEntry {
  return {
    id: entry.id !== undefined ? entry.id : -1, // -1 sebagai placeholder jika belum ada id dari DB
    date: entry.date || new Date().toISOString().split('T')[0],
    patientName: entry.patientName || 'Tidak ada nama',
    medicalRecordNumber: entry.medicalRecordNumber || '-',
    gender: entry.gender || 'Tidak diketahui',
    paymentType: entry.paymentType || 'UMUM',
    actions: Array.isArray(entry.actions) ? entry.actions : [],
    otherActions: entry.otherActions || '-',
    description: entry.description || '',
    createdAt: entry.createdAt || new Date().toISOString()
  };
}

export const storage = {
  // Get all data entries
  getDataEntries(): DataEntry[] {
    const data = readData();
    return data.entries.map(formatEntry);
  },

  // Get data entries by date range
  getDataEntriesByDateRange(startDate: string, endDate: string): DataEntry[] {
    const data = readData();
    return data.entries
      .filter(entry => {
        const entryDate = entry.date;
        return entryDate >= startDate && entryDate <= endDate;
      })
      .map(formatEntry);
  },

  // Add new data entry
  addDataEntry(entry: Partial<DataEntry>): DataEntry {
    const data = readData();
    const newEntry = formatEntry({
      ...entry,
      // id: Date.now(), // HAPUS baris ini, biarkan id undefined
      createdAt: new Date().toISOString()
    });
    data.entries.push(newEntry);
    writeData(data);
    return newEntry;
  },

  // Update existing data entry
  updateDataEntry(id: number, updatedEntry: Partial<DataEntry>): DataEntry | null {
    const data = readData();
    const index = data.entries.findIndex(entry => entry.id === id);
    
    if (index !== -1) {
      data.entries[index] = formatEntry({
        ...data.entries[index],
        ...updatedEntry,
        id: id // Ensure ID doesn't change
      });
      
      writeData(data);
      return data.entries[index];
    }
    
    return null;
  },

  // Delete data entry
  deleteDataEntry(id: number): DataEntry | null {
    const data = readData();
    const index = data.entries.findIndex(entry => entry.id === id);
    
    if (index !== -1) {
      const deletedEntry = data.entries[index];
      data.entries.splice(index, 1);
      writeData(data);
      return deletedEntry;
    }
    
    return null;
  }
};