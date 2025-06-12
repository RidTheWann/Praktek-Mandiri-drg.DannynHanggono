// ===================================================================================
// Google Apps Script untuk Manajemen Data Pasien (CRUD)
//
// Fitur Utama:
// 1. Operasi CRUD (Add, Edit, Delete, Get).
// 2. Sheet bulanan dibuat secara otomatis (misal: "Juni 2025").
// 3. Nomor antrean otomatis yang di-reset setiap hari.
// 4. Penggunaan LockService untuk mencegah race conditions (aman untuk banyak pengguna).
// 5. Identifier unik (Tanggal, Nama, No.RM) untuk operasi Edit & Delete yang akurat.
// 6. Optimasi batch update untuk performa tinggi saat mengurutkan ulang nomor antrean.
//
// PENTING: Aktifkan "Google Sheets API" di menu "Layanan" (Services) pada editor.
// ===================================================================================

/**
 * Menangani permintaan HTTP GET.
 * @param {Object} e Event parameter dari permintaan GET.
 * @returns {ContentService.TextOutput} Respons JSON.
 */
function doGet(e) {
  return handleResponse(e);
}

/**
 * Menangani permintaan HTTP POST.
 * @param {Object} e Event parameter dari permintaan POST.
 * @returns {ContentService.TextOutput} Respons JSON.
 */
function doPost(e) {
  // Log permintaan yang masuk untuk debugging
  Logger.log("========== NEW REQUEST ==========");
  Logger.log("Received POST request with parameters:");
  for (var key in e.parameter) {
    Logger.log(key + ": " + e.parameter[key]);
  }
  
  return handleResponse(e);
}

/**
 * Fungsi utama untuk menangani semua jenis permintaan (controller).
 * @param {Object} e Event parameter dari permintaan.
 * @returns {ContentService.TextOutput} Respons JSON.
 */
function handleResponse(e) {
  try {
    if (!e || !e.parameter) {
      Logger.log("ERROR: Permintaan tidak valid atau tidak memiliki parameter.");
      throw new Error("Permintaan tidak valid atau tidak memiliki parameter.");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = e.parameter.month && e.parameter.year ?
      getSheetNameFromParams(e.parameter.month, e.parameter.year) :
      getCurrentSheetName();

    Logger.log("Using sheet: " + sheetName);
    var sheet = createSheetIfNotExists(ss, sheetName);

    var action = e.parameter.action || "add"; // Default action adalah 'add'

    Logger.log("Action: " + action + ", Sheet: " + sheetName + ", Params: " + JSON.stringify(e.parameter));
    
    // Perbaiki format No.RM jika perlu untuk operasi delete dan edit
    if ((action.toLowerCase() === "delete" || action.toLowerCase() === "edit") && 
        (e.parameter["No.RM"] === undefined || e.parameter["No.RM"] === null)) {
      e.parameter["No.RM"] = "-";
      Logger.log("No.RM is undefined or null, setting to '-'");
    }

    var result;
    switch (action.toLowerCase()) {
      case "delete":
        Logger.log("Processing DELETE action");
        result = deleteData(e.parameter, sheet);
        break;
      case "edit":
        Logger.log("Processing EDIT action");
        result = editData(e.parameter, sheet);
        break;
      case "get":
        Logger.log("Processing GET action");
        result = getAllData(e);
        break;
      case "add":
      default:
        Logger.log("Processing ADD action (default)");
        result = addData(e.parameter, sheet);
        break;
    }
    
    Logger.log("Operation completed successfully");
    return result;
  } catch (error) {
    Logger.log("Error in handleResponse: " + error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: error.toString(),
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===================================================================================
// FUNGSI OPERASI DATA (CRUD) DENGAN LOCKSERVICE
// ===================================================================================

/**
 * Menambahkan data baru ke sheet. Menggunakan LockService untuk keamanan.
 * @param {Object} data Data pasien baru dari parameter.
 * @param {Sheet} sheet Sheet yang aktif.
 * @returns {ContentService.TextOutput} Hasil operasi dalam format JSON.
 */
function addData(data, sheet) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // Tunggu maksimal 30 detik untuk mendapatkan kunci

  try {
    if (!data) {
      throw new Error("Tidak ada data yang diberikan untuk ditambahkan.");
    }

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = [];
    var tanggalKunjungan = data["Tanggal Kunjungan"] || data["tanggal_kunjungan"] || new Date();
    
    tanggalKunjungan = normalizeDateString(tanggalKunjungan); // Pastikan formatnya YYYY-MM-DD

    // Iterasi melalui header untuk membangun baris baru
    for (var i = 0; i < headers.length; i++) {
      var headerName = headers[i];
      var headerNormalized = normalizeString(headerName).replace(/[._\s]/g, '');
      var foundValue = null;

      if (headerNormalized === "tanggalkunjungan") {
        newRow.push(tanggalKunjungan);
        continue;
      }
      
      if (headerNormalized === "noantrean") {
        var antreanNumber = generateAntreanNumber(sheet, tanggalKunjungan);
        newRow.push(antreanNumber);
        continue;
      }

      // Cari nilai dari data input yang cocok dengan header
      for (var key in data) {
        var keyNormalized = normalizeString(key).replace(/[._\s]/g, '');
        if (keyNormalized === headerNormalized) {
          foundValue = data[key];
          break;
        }
      }
      newRow.push(foundValue || ""); // Isi string kosong jika tidak ditemukan
    }

    sheet.appendRow(newRow);

    // Cari kembali nomor antrean yang baru saja ditambahkan untuk dikembalikan
    var antreanColIndex = findColumnIndex(headers, ["no.antrean", "noantrean"]);
    var antreanNumberResult = newRow[antreanColIndex] || "N/A";

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Data added successfully",
      data: {
        tanggal_kunjungan: tanggalKunjungan,
        antrean_number: antreanNumberResult
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in addData: " + error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: "Error in addData: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock(); // Selalu lepaskan kunci
  }
}

/**
 * Mengedit data yang ada di sheet. Menggunakan LockService.
 * @param {Object} data Data baru dan identifier untuk record yang akan diedit.
 * @param {Sheet} sheet Sheet yang aktif.
 * @returns {ContentService.TextOutput} Hasil operasi dalam format JSON.
 */
function editData(data, sheet) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var validation = validateIdentifiers(data);
    if (!validation.isValid) {
      throw new Error("Validation failed: " + validation.errors.join(", "));
    }

    var searchResult = findRecordByIdentifiers(sheet, validation.identifiers);
    if (!searchResult.found) {
      throw new Error(searchResult.message);
    }
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var updatedRow = [];
    var oldTanggalKunjungan = searchResult.rowData[searchResult.columnIndexes.date];
    var newTanggalKunjungan = data["Tanggal Kunjungan"] || data["tanggal_kunjungan"] || oldTanggalKunjungan;
    var dateChanged = normalizeDateString(newTanggalKunjungan) !== normalizeDateString(oldTanggalKunjungan);

    for (var i = 0; i < headers.length; i++) {
        var headerName = headers[i];
        var headerNormalized = normalizeString(headerName).replace(/[._\s]/g, '');
        var newValue = null;

        // Jika nomor antrean dan tanggal berubah, generate baru
        if (headerNormalized === "noantrean" && dateChanged) {
            updatedRow.push(generateAntreanNumber(sheet, newTanggalKunjungan));
            continue;
        }

        // Cari data baru untuk kolom ini
        for (var key in data) {
            if (key === "action") continue;
            var keyNormalized = normalizeString(key).replace(/[._\s]/g, '');
            if (keyNormalized === headerNormalized) {
                newValue = data[key];
                break;
            }
        }
        
        // Jika ada nilai baru, gunakan. Jika tidak, pertahankan nilai lama.
        updatedRow.push(newValue !== null && newValue !== undefined ? newValue : searchResult.rowData[i]);
    }
    
    sheet.getRange(searchResult.rowIndex + 1, 1, 1, headers.length).setValues([updatedRow]);

    if (dateChanged) {
        reorderAntreanNumbersAdvanced(sheet, normalizeDateString(oldTanggalKunjungan));
    }

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Data updated successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in editData: " + error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: "Error in editData: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Menghapus data dari sheet. Menggunakan LockService.
 * @param {Object} data Identifier untuk record yang akan dihapus.
 * @param {Sheet} sheet Sheet yang aktif.
 * @returns {ContentService.TextOutput} Hasil operasi dalam format JSON.
 */
function deleteData(data, sheet) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    // Log data yang diterima untuk debugging
    Logger.log("Received delete request with data:");
    for (var key in data) {
      Logger.log(key + ": " + data[key]);
    }
    
    // Perbaiki format No.RM jika perlu
    if (data["No.RM"] === undefined || data["No.RM"] === null) {
      data["No.RM"] = "-";
      Logger.log("No.RM is undefined or null, setting to '-'");
    }
    
    var validation = validateIdentifiers(data);
    if (!validation.isValid) {
      Logger.log("Validation failed: " + validation.errors.join(", "));
      throw new Error("Validation failed: " + validation.errors.join(", "));
    }
    
    // Log identifiers setelah validasi
    Logger.log("Validated identifiers:");
    Logger.log("tanggalKunjungan: " + validation.identifiers.tanggalKunjungan);
    Logger.log("namaPasien: " + validation.identifiers.namaPasien);
    Logger.log("noRm: " + validation.identifiers.noRm);

    var searchResult = findRecordByIdentifiers(sheet, validation.identifiers);
    if (!searchResult.found) {
      Logger.log("Record not found: " + searchResult.message);
      
      // Coba cari dengan hanya tanggal dan nama (abaikan No.RM)
      Logger.log("Trying to find record with only date and name...");
      var simplifiedIdentifiers = {
        tanggalKunjungan: validation.identifiers.tanggalKunjungan,
        namaPasien: validation.identifiers.namaPasien,
        noRm: "-" // Gunakan "-" sebagai placeholder
      };
      
      var secondSearchResult = findRecordByIdentifiers(sheet, simplifiedIdentifiers);
      if (!secondSearchResult.found) {
        Logger.log("Still not found even with simplified search");
        throw new Error(searchResult.message);
      }
      
      Logger.log("Record found with simplified search at row " + (secondSearchResult.rowIndex + 1));
      searchResult = secondSearchResult;
    }
    
    Logger.log("Record found at row " + (searchResult.rowIndex + 1));
    var deletedDate = normalizeDateString(searchResult.rowData[searchResult.columnIndexes.date]);
    
    sheet.deleteRow(searchResult.rowIndex + 1);
    
    if (deletedDate) {
      reorderAntreanNumbersAdvanced(sheet, deletedDate);
    }

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Data deleted successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in deleteData: " + error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: "Error in deleteData: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Mengambil semua data dari sheet yang ditentukan.
 * @param {Object} e Event parameter yang mungkin berisi bulan dan tahun.
 * @returns {ContentService.TextOutput} Data sheet dalam format JSON.
 */
function getAllData(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = e.parameter.month && e.parameter.year ?
      getSheetNameFromParams(e.parameter.month, e.parameter.year) :
      getCurrentSheetName();

    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        result: "success",
        data: [],
        sheet_name: sheetName,
        message: "Sheet for " + sheetName + " does not exist yet."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      data: values,
      sheet_name: sheetName
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in getAllData: " + error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: "Error in getAllData: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===================================================================================
// FUNGSI HELPER & UTILITY
// ===================================================================================

/**
 * Membuat sheet baru jika belum ada, lengkap dengan header dan format.
 * @param {Spreadsheet} ss Spreadsheet aktif.
 * @param {string} sheetName Nama sheet yang akan dibuat.
 * @returns {Sheet} Sheet yang baru dibuat atau yang sudah ada.
 */
function createSheetIfNotExists(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var defaultHeaders = [
      "Tanggal Kunjungan", "No.Antrean", "Nama Pasien", "No.RM", "Kelamin",
      "Biaya", "Obat", "Cabut Anak", "Cabut Dewasa", "Tambal Sementara",
      "Tambal Tetap", "Scaling", "Rujuk", "Lainnya"
    ];
    sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
    var headerRange = sheet.getRange(1, 1, 1, defaultHeaders.length);
    headerRange.setBackground('#b6d7a8').setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setColumnWidths(1, defaultHeaders.length, 120); // Atur lebar default
    sheet.setFrozenRows(1);
    Logger.log("Created new sheet with headers: " + sheetName);
  }
  return sheet;
}

/**
 * Mendapatkan nama sheet berdasarkan parameter bulan dan tahun.
 * @param {string|number} month Nama atau nomor bulan.
 * @param {string|number} year Tahun.
 * @returns {string} Nama sheet (e.g., "Juni 2025").
 */
function getSheetNameFromParams(month, year) {
  var months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  if (month && year) {
    if (!isNaN(month) && month >= 1 && month <= 12) {
      return months[month - 1] + " " + year;
    }
    return month + " " + year;
  }
  return getCurrentSheetName();
}

/**
 * Mendapatkan nama sheet untuk bulan dan tahun saat ini.
 * @returns {string} Nama sheet saat ini.
 */
function getCurrentSheetName() {
  var now = new Date();
  var months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return months[now.getMonth()] + " " + now.getFullYear();
}

/**
 * Menormalisasi berbagai format tanggal menjadi 'YYYY-MM-DD'.
 * @param {string|Date} dateStr Input tanggal.
 * @returns {string|null} Tanggal terformat atau null jika tidak valid.
 */
function normalizeDateString(dateStr) {
  if (!dateStr) return null;
  try {
    var date = new Date(dateStr);
    if (isNaN(date.getTime())) { // Jika parsing langsung gagal, coba format lain
        var parts = dateStr.toString().match(/(\d+)/g);
        if(parts && parts.length >= 3) {
           // Coba format DD-MM-YYYY
           if(parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
              date = new Date(parts[2], parts[1] - 1, parts[0]);
           }
        }
    }
    if (isNaN(date.getTime())) return null;
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, '0') + "-" +
      String(date.getDate()).padStart(2, '0');
  } catch (e) {
    return null;
  }
}

/**
 * Menormalisasi string (lowercase, trim, hapus karakter khusus).
 * @param {string} str Input string.
 * @returns {string} String ternormalisasi.
 */
function normalizeString(str) {
  if (!str) return "";
  var trimmedStr = str.toString().trim(); // Trim first
  
  // Treat hyphen, dash, or single character as empty string for better matching
  if (trimmedStr === "-" || trimmedStr === "–" || trimmedStr === "—" || trimmedStr === "/" || trimmedStr === "n/a" || trimmedStr === "na") {
    return "";
  }
  
  // Untuk No.RM, hapus semua karakter khusus (titik, spasi, dll)
  // Ini membantu mencocokkan No.RM seperti "21.05.04" dengan "210504"
  if (trimmedStr.match(/^[0-9.\s-]+$/)) {
    return trimmedStr.toLowerCase().replace(/[^0-9]/g, ''); // Hapus semua karakter non-angka
  }
  
  // Untuk string lainnya, hanya lowercase dan replace multiple spaces
  return trimmedStr.toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Mencari indeks kolom berdasarkan nama header.
 * @param {Array<string>} headers Array header.
 * @param {Array<string>} columnNames Alternatif nama kolom yang dicari.
 * @returns {number} Indeks kolom (berbasis 0) atau -1 jika tidak ditemukan.
 */
function findColumnIndex(headers, columnNames) {
  for (var i = 0; i < headers.length; i++) {
    var headerNormalized = normalizeString(headers[i]).replace(/[._\s]/g, '');
    for (var j = 0; j < columnNames.length; j++) {
      if (headerNormalized === normalizeString(columnNames[j]).replace(/[._\s]/g, '')) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Menghasilkan nomor antrean berikutnya untuk tanggal tertentu.
 * @param {Sheet} sheet Sheet aktif.
 * @param {string} targetDate Tanggal target dalam format 'YYYY-MM-DD'.
 * @returns {number} Nomor antrean baru.
 */
function generateAntreanNumber(sheet, targetDate) {
  var normalizedTargetDate = normalizeDateString(targetDate);
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return 1;

  var headers = values[0];
  var dateColIndex = findColumnIndex(headers, ["tanggal kunjungan", "tanggalkunjungan"]);
  var antreanColIndex = findColumnIndex(headers, ["no.antrean", "noantrean"]);

  if (dateColIndex === -1 || antreanColIndex === -1) return 1;

  var maxAntreanForDate = 0;
  for (var i = 1; i < values.length; i++) {
    if (normalizeDateString(values[i][dateColIndex]) === normalizedTargetDate) {
      var antreanNum = parseInt(values[i][antreanColIndex]);
      if (!isNaN(antreanNum) && antreanNum > maxAntreanForDate) {
        maxAntreanForDate = antreanNum;
      }
    }
  }
  return maxAntreanForDate + 1;
}

/**
 * Memvalidasi identifier yang diperlukan (Tanggal, Nama, No.RM).
 * @param {Object} data Data input.
 * @returns {Object} Hasil validasi.
 */
function validateIdentifiers(data) {
  var errors = [];
  var identifiers = {};

  if (data.action && data.action.toLowerCase() === 'edit') {
    identifiers.tanggalKunjungan = data["Tanggal Kunjungan_asli"];
    identifiers.namaPasien = data["Nama Pasien_asli"];
    identifiers.noRm = data["No.RM_asli"];
    if (!identifiers.tanggalKunjungan) errors.push("Original Tanggal Kunjungan is required for edit");
    if (!identifiers.namaPasien || normalizeString(identifiers.namaPasien) === "") errors.push("Original Nama Pasien is required for edit");
    // No.RM bisa kosong atau berisi karakter khusus, jadi tidak perlu validasi ketat
  } else {
    identifiers.tanggalKunjungan = data.tanggal_kunjungan || data["Tanggal Kunjungan"];
    identifiers.namaPasien = data.nama_pasien || data["Nama Pasien"];
    identifiers.noRm = data.no_rm || data["No.RM"];
    if (!identifiers.tanggalKunjungan) errors.push("Tanggal Kunjungan is required");
    if (!identifiers.namaPasien || normalizeString(identifiers.namaPasien) === "") errors.push("Nama Pasien is required");
    // No.RM bisa kosong atau berisi karakter khusus, jadi tidak perlu validasi ketat
  }
  
  // Pastikan noRm selalu memiliki nilai, bahkan jika kosong
  identifiers.noRm = identifiers.noRm || "-";
  
  return { isValid: errors.length === 0, errors: errors, identifiers: identifiers };
}

/**
 * Mencari record berdasarkan identifier (Tanggal, Nama, No.RM).
 * @param {Sheet} sheet Sheet aktif.
 * @param {Object} identifiers Identifier yang akan dicari.
 * @returns {Object} Hasil pencarian.
 */
function findRecordByIdentifiers(sheet, identifiers) {
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    return { found: false, message: "No data in sheet" };
  }
  
  var headers = values[0];
  var dateColIndex = findColumnIndex(headers, ["tanggal kunjungan", "tanggalkunjungan"]);
  var nameColIndex = findColumnIndex(headers, ["nama pasien", "namapasien"]);
  var rmColIndex = findColumnIndex(headers, ["no.rm", "norm"]);

  if (dateColIndex === -1 || nameColIndex === -1 || rmColIndex === -1) {
    return { found: false, message: "Required columns (Tanggal/Nama/No.RM) not found in sheet." };
  }

  var normalizedTargetDate = normalizeDateString(identifiers.tanggalKunjungan);
  var normalizedTargetName = normalizeString(identifiers.namaPasien);
  var normalizedTargetRm = normalizeString(identifiers.noRm);
  
  // Log untuk debugging
  Logger.log("Searching for record with identifiers:");
  Logger.log("Date: " + identifiers.tanggalKunjungan + " (normalized: " + normalizedTargetDate + ")");
  Logger.log("Name: " + identifiers.namaPasien + " (normalized: " + normalizedTargetName + ")");
  Logger.log("RM: " + identifiers.noRm + " (normalized: " + normalizedTargetRm + ")");

  // Array untuk menyimpan kandidat baris yang cocok sebagian
  var partialMatches = [];
  
  for (var i = 1; i < values.length; i++) {
    var rowDate = normalizeDateString(values[i][dateColIndex]);
    var rowName = normalizeString(values[i][nameColIndex]);
    var rowRm = normalizeString(values[i][rmColIndex]);
    
    // Log setiap baris untuk debugging
    Logger.log("Row " + (i+1) + " values:");
    Logger.log("  Date: " + values[i][dateColIndex] + " (normalized: " + rowDate + ")");
    Logger.log("  Name: " + values[i][nameColIndex] + " (normalized: " + rowName + ")");
    Logger.log("  RM: " + values[i][rmColIndex] + " (normalized: " + rowRm + ")");
    
    // Cek kecocokan penuh (tanggal, nama, dan RM)
    if (rowDate === normalizedTargetDate && rowName === normalizedTargetName) {
      // Jika No.RM kosong di kedua sisi atau cocok, anggap ditemukan
      if ((rowRm === "" && normalizedTargetRm === "") || rowRm === normalizedTargetRm) {
        Logger.log("MATCH FOUND at row " + (i+1) + " (full match)");
        return {
          found: true,
          rowIndex: i,
          rowData: values[i],
          columnIndexes: { date: dateColIndex, name: nameColIndex, rm: rmColIndex }
        };
      }
      
      // Simpan sebagai kandidat jika tanggal dan nama cocok
      partialMatches.push({
        rowIndex: i,
        rowData: values[i],
        matchLevel: 2, // 2 = tanggal dan nama cocok
        rmValue: values[i][rmColIndex],
        normalizedRm: rowRm
      });
      
      // Log untuk debugging jika nama dan tanggal cocok tapi No.RM tidak
      Logger.log("Found matching date and name at row " + (i+1) + ", but RM doesn't match:");
      Logger.log("Sheet RM: " + values[i][rmColIndex] + " (normalized: " + rowRm + ")");
      Logger.log("Target RM: " + identifiers.noRm + " (normalized: " + normalizedTargetRm + ")");
    } else if (rowDate === normalizedTargetDate) {
      // Simpan sebagai kandidat jika hanya tanggal yang cocok
      partialMatches.push({
        rowIndex: i,
        rowData: values[i],
        matchLevel: 1, // 1 = hanya tanggal cocok
        nameValue: values[i][nameColIndex],
        normalizedName: rowName
      });
    }
  }
  
  // Jika ada kandidat dengan tanggal dan nama yang cocok, gunakan yang pertama
  var dateNameMatches = partialMatches.filter(function(match) { return match.matchLevel === 2; });
  if (dateNameMatches.length > 0) {
    var bestMatch = dateNameMatches[0];
    Logger.log("Using best partial match (date+name) at row " + (bestMatch.rowIndex+1));
    Logger.log("Sheet RM: " + bestMatch.rmValue + " (normalized: " + bestMatch.normalizedRm + ")");
    Logger.log("Target RM: " + identifiers.noRm + " (normalized: " + normalizedTargetRm + ")");
    
    return {
      found: true,
      rowIndex: bestMatch.rowIndex,
      rowData: bestMatch.rowData,
      columnIndexes: { date: dateColIndex, name: nameColIndex, rm: rmColIndex }
    };
  }
  return { found: false, message: "Record not found with provided identifiers." };
}

// ===================================================================================
// FUNGSI REORDER ANTREN (METODE ADVANCED DENGAN FALLBACK)
// ===================================================================================

/**
 * Mengurutkan ulang nomor antrean menggunakan Sheets API untuk performa maksimal.
 * Jika gagal, akan kembali menggunakan metode standar.
 * @param {Sheet} sheet Sheet aktif.
 * @param {string} targetDate Tanggal yang akan diurutkan ulang.
 */
function reorderAntreanNumbersAdvanced(sheet, targetDate) {
  try {
    var values = sheet.getDataRange().getValues();
    if (values.length <= 1) return;

    var headers = values[0];
    var dateColIndex = findColumnIndex(headers, ["tanggal kunjungan", "tanggalkunjungan"]);
    var antreanColIndex = findColumnIndex(headers, ["no.antrean", "noantrean"]);

    if (dateColIndex === -1 || antreanColIndex === -1) return;

    var rowsToUpdate = [];
    for (var i = 1; i < values.length; i++) {
      if (normalizeDateString(values[i][dateColIndex]) === targetDate) {
        rowsToUpdate.push({ sheetRowIndex: i + 1 });
      }
    }
    
    if (rowsToUpdate.length === 0) return;

    // Urutkan berdasarkan posisi di sheet untuk konsistensi
    rowsToUpdate.sort(function(a, b) { return a.sheetRowIndex - b.sheetRowIndex; });

    var requests = rowsToUpdate.map(function(rowInfo, index) {
      return {
        updateCells: {
          range: {
            sheetId: sheet.getSheetId(),
            startRowIndex: rowInfo.sheetRowIndex - 1,
            endRowIndex: rowInfo.sheetRowIndex,
            startColumnIndex: antreanColIndex,
            endColumnIndex: antreanColIndex + 1
          },
          rows: [{ values: [{ userEnteredValue: { numberValue: index + 1 } }] }],
          fields: "userEnteredValue"
        }
      };
    });

    Sheets.Spreadsheets.batchUpdate({ requests: requests }, sheet.getParent().getId());
    Logger.log("Advanced batch update completed for " + requests.length + " rows on date " + targetDate);

  } catch (error) {
    Logger.log("Error in reorderAntreanNumbersAdvanced: " + error.toString() + ". Falling back to standard method.");
    reorderAntreanNumbersStandard(sheet, targetDate); // Fallback method
  }
}

/**
 * Metode standar untuk mengurutkan ulang nomor antrean.
 * Digunakan sebagai fallback jika metode advanced gagal.
 * @param {Sheet} sheet Sheet aktif.
 * @param {string} targetDate Tanggal yang akan diurutkan ulang.
 */
function reorderAntreanNumbersStandard(sheet, targetDate) {
  try {
    var values = sheet.getDataRange().getValues();
    if (values.length <= 1) return;

    var headers = values[0];
    var dateColIndex = findColumnIndex(headers, ["tanggal kunjungan", "tanggalkunjungan"]);
    var antreanColIndex = findColumnIndex(headers, ["no.antrean", "noantrean"]);

    if (dateColIndex === -1 || antreanColIndex === -1) return;
    
    var rowsForDate = [];
    for(var i = 1; i < values.length; i++) {
      if(normalizeDateString(values[i][dateColIndex]) === targetDate) {
        rowsForDate.push({
          sheetRowIndex: i + 1,
          currentAntrean: parseInt(values[i][antreanColIndex]) || 0
        });
      }
    }

    if(rowsForDate.length === 0) return;

    rowsForDate.sort(function(a,b){ return a.sheetRowIndex - b.sheetRowIndex; });

    var newAntreanValues = [];
    for(var j=0; j < rowsForDate.length; j++){
      newAntreanValues.push([j+1]);
    }
    
    // Cek jika barisnya berurutan
    var isContiguous = rowsForDate.every(function(row, index, arr){
      return index === 0 || row.sheetRowIndex === arr[index-1].sheetRowIndex + 1;
    });

    if(isContiguous) {
      // Update dalam satu batch jika berurutan
      var startRow = rowsForDate[0].sheetRowIndex;
      sheet.getRange(startRow, antreanColIndex + 1, rowsForDate.length, 1).setValues(newAntreanValues);
    } else {
      // Update satu per satu jika tidak berurutan
      rowsForDate.forEach(function(row, index){
        sheet.getRange(row.sheetRowIndex, antreanColIndex + 1).setValue(index + 1);
      });
    }
    Logger.log("Standard reorder completed for " + rowsForDate.length + " rows on date " + targetDate);

  } catch(error) {
    Logger.log("Error in reorderAntreanNumbersStandard: " + error.toString());
  }
}