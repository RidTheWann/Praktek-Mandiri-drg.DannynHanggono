import { initDatabase, getAllEntries, getEntriesByDateRange, addEntry, updateEntry, deleteEntry } from './db';
import { submitToGoogleSheets, deleteFromGoogleSheets } from './sheets';

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
  async getDataEntriesByDateRange(startDate: string, endDate: string) {
    return await getEntriesByDateRange(startDate, endDate);
  },

  // Add new entry to both database and Google Sheets
  async addDataEntry(entry: any) {
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
  async updateDataEntry(id: number, entry: any) {
    try {
      // Get the original entry to use as identifier for Google Sheets
      const entries = await getAllEntries();
      const originalEntry = entries.find(e => e.id === id);
      
      if (!originalEntry) {
        return null;
      }
      
      // Add original identifiers to entry for Google Sheets
      entry.originalIdentifiers = {
        date: originalEntry.date,
        patientName: originalEntry.patientName,
        medicalRecordNumber: originalEntry.medicalRecordNumber
      };
      
      // First update in database
      const updatedEntry = await updateEntry(id, entry);
      
      if (!updatedEntry) {
        return null;
      }
      
      // Then sync to Google Sheets
      await submitToGoogleSheets(entry, true);
      
      return updatedEntry;
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  },

  // Delete entry from both database and Google Sheets
  async deleteDataEntry(id: number) {
    try {
      // First get the entry to be deleted
      const entries = await getAllEntries();
      const entryToDelete = entries.find(entry => entry.id === id);
      
      if (!entryToDelete) {
        return null;
      }
      
      // Delete from database
      const deletedEntry = await deleteEntry(id);
      
      if (!deletedEntry) {
        return null;
      }
      
      // Then delete from Google Sheets
      await deleteFromGoogleSheets(entryToDelete);
      
      return deletedEntry;
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }
};