import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ entries: [] }));
}

// Read data from file
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { entries: [] };
  }
}

// Write data to file
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

// Format entry to ensure all fields are present
function formatEntry(entry) {
  return {
    id: entry.id || Date.now(),
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
  getDataEntries() {
    const data = readData();
    return data.entries.map(formatEntry);
  },

  // Get data entries by date range
  getDataEntriesByDateRange(startDate, endDate) {
    const data = readData();
    return data.entries
      .filter(entry => {
        const entryDate = entry.date;
        return entryDate >= startDate && entryDate <= endDate;
      })
      .map(formatEntry);
  },

  // Add new data entry
  addDataEntry(entry) {
    const data = readData();
    const newEntry = formatEntry({
      ...entry,
      id: Date.now(),
      createdAt: new Date().toISOString()
    });
    
    data.entries.push(newEntry);
    writeData(data);
    return newEntry;
  },

  // Update existing data entry
  updateDataEntry(id, updatedEntry) {
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
  deleteDataEntry(id) {
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