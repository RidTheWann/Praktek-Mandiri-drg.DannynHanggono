import fetch from 'node-fetch';

// Action options mapping for Google Sheets
const actionOptions = [
  { id: "obat", label: "Obat" },
  { id: "cabut-anak", label: "Cabut Anak" },
  { id: "cabut-dewasa", label: "Cabut Dewasa" },
  { id: "tambal-sementara", label: "Tambal Sementara" },
  { id: "tambal-tetap", label: "Tambal Tetap" },
  { id: "scaling", label: "Scaling" },
  { id: "rujuk", label: "Rujuk" },
];

// Define response type for Google Sheets API
interface GoogleSheetsResponse {
  result: string;
  message?: string;
  data?: any;
}

// Submit data to Google Sheets
export async function submitToGoogleSheets(data: any, isUpdate = false, id?: number) {
  try {
    // Map data to Google Sheets format
    const mappedFormObject: Record<string, string> = {
      "Tanggal Kunjungan": data.date,
      "Nama Pasien": data.patientName,
      "No.RM": data.medicalRecordNumber,
      "Kelamin": data.gender,
      "Biaya": data.paymentType,
      "Lainnya": data.otherActions || ""
    };
    
    // Add selected actions to mappedFormObject
    actionOptions.forEach(option => {
      if (data.actions && data.actions.includes(option.id)) {
        mappedFormObject[option.label] = "Yes";
      } else {
        mappedFormObject[option.label] = "No";
      }
    });
    
    // Add update info if needed
    if (isUpdate && id) {
      mappedFormObject["id"] = id.toString();
      mappedFormObject["action"] = "update";
    }
    
    // Create URL-encoded form data
    const formData = new URLSearchParams();
    Object.entries(mappedFormObject).forEach(([key, value]) => {
      formData.append(key, value || '');
    });
    
    // Submit to Google Sheets
    const sheetsUrl = process.env.GOOGLE_SHEETS_URL;
    console.log(`Submitting to Google Sheets URL: ${sheetsUrl}`);
    
    const response = await fetch(sheetsUrl || '', {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    
    const result = await response.json() as GoogleSheetsResponse;
    
    if (result.result !== "success") {
      console.error("Failed to submit to Google Sheets:", result.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error submitting to Google Sheets:", error);
    return false;
  }
}

// Delete entry from Google Sheets
export async function deleteFromGoogleSheets(entry: any) {
  try {
    // Map data for deletion
    const mappedFormObject: Record<string, string> = {
      "action": "delete",
      "id": entry.id.toString(),
      "Tanggal Kunjungan": entry.date,
      "Nama Pasien": entry.patientName,
      "No.RM": entry.medicalRecordNumber,
      "Kelamin": entry.gender,
      "Biaya": entry.paymentType,
      "Lainnya": entry.otherActions || ""
    };
    
    // Add actions
    actionOptions.forEach(option => {
      if (entry.actions && entry.actions.includes(option.id)) {
        mappedFormObject[option.label] = "Yes";
      } else {
        mappedFormObject[option.label] = "No";
      }
    });
    
    // Create URL-encoded form data
    const formData = new URLSearchParams();
    Object.entries(mappedFormObject).forEach(([key, value]) => {
      formData.append(key, value || '');
    });
    
    // Submit to Google Sheets
    const sheetsUrl = process.env.GOOGLE_SHEETS_URL;
    console.log(`Deleting from Google Sheets URL: ${sheetsUrl}`);
    
    const response = await fetch(sheetsUrl || '', {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    
    const result = await response.json() as GoogleSheetsResponse;
    
    if (result.result !== "success") {
      console.error("Failed to delete from Google Sheets:", result.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting from Google Sheets:", error);
    return false;
  }
}