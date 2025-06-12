import { initDatabase, getAllEntries, getEntriesByDateRange, addEntry, updateEntry, deleteEntry } from './db.js';
import { submitToGoogleSheets, deleteFromGoogleSheets } from './sheets.js';

// Initialize database on startup
initDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

// Combined storage service that syncs between database and Google Sheets
export const combinedStorage = {
  // Get all entries from database
  async getDataEntries() {
    return await getAllEntries();
  },

  // Get entries by date range
  async getDataEntriesByDateRange(startDate, endDate) {
    return await getEntriesByDateRange(startDate, endDate);
  },

  // Add new entry to both database and Google Sheets
  async createDataEntry(entry) {
    try {
      // First add to database
      const newEntry = await addEntry(entry);
      
      // Then sync to Google Sheets
      await submitToGoogleSheets(entry);
      
      return newEntry;
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  },

  // Update entry in both database and Google Sheets
  async updateDataEntry(id, entry) {
    try {
      // First update in database
      const updatedEntry = await updateEntry(id, entry);
      
      if (!updatedEntry) {
        return null;
      }
      
      // Then sync to Google Sheets
      await submitToGoogleSheets(entry, true, id);
      
      return updatedEntry;
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  },

  // Delete entry in both database and Google Sheets
  async deleteDataEntry(id) {
    try {
      // First delete from database
      const deleted = await deleteEntry(id);
      // Then delete from Google Sheets
      await deleteFromGoogleSheets(id);
      return deleted;
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }
};