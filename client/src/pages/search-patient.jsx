var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Users, FileText, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
var actionLabels = {
    obat: 'Obat',
    'cabut-anak': 'Cabut anak',
    'cabut-dewasa': 'Cabut dewasa',
    'tambal-sementara': 'Tambal Sementara',
    'tambal-tetap': 'Tambal Tetap',
    scaling: 'Scaling',
    rujuk: 'Rujuk'
};
export default function SearchPatient() {
    var _this = this;
    var _a = useState(""), searchTerm = _a[0], setSearchTerm = _a[1];
    var _b = useState("name"), searchType = _b[0], setSearchType = _b[1];
    var _c = useState(false), isSearching = _c[0], setIsSearching = _c[1];
    var _d = useState(""), debouncedSearchTerm = _d[0], setDebouncedSearchTerm = _d[1];
    // Debounce search term to reduce API calls
    var handleSearchTermChange = function (value) {
        setSearchTerm(value);
        // Clear previous timeout
        var timeoutId = setTimeout(function () {
            setDebouncedSearchTerm(value);
        }, 300); // 300ms delay
        return function () { return clearTimeout(timeoutId); };
    };
    // Only fetch data when actually searching
    var shouldFetch = debouncedSearchTerm.length >= 2; // Only search with 2+ characters
    // Fetch entries based on search parameters
    var _e = useQuery({
        queryKey: ["/api/data-entries", searchType, debouncedSearchTerm],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!shouldFetch)
                            return [2 /*return*/, []];
                        params = new URLSearchParams();
                        if (searchType === "name")
                            params.append("name", debouncedSearchTerm);
                        if (searchType === "medicalRecord")
                            params.append("medicalRecord", debouncedSearchTerm);
                        if (searchType === "action")
                            params.append("action", debouncedSearchTerm);
                        return [4 /*yield*/, apiRequest("GET", "/api/data-entries?".concat(params.toString()))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        enabled: shouldFetch, // Only run query when search term is valid
        staleTime: 30000, // Cache results for 30 seconds
    }), entries = _e.data, isLoading = _e.isLoading;
    // Filter entries client-side for immediate feedback
    var filteredEntries = entries || [];
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={function () { return window.location.href = '/dashboard'; }} className="rounded-full">
              <ArrowLeft className="h-5 w-5"/>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Cari Data Pasien
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Temukan data pasien berdasarkan nama, nomor rekam medis, atau tindakan
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }} className="mb-6 sm:mb-8">
          <Card className="hover:shadow-lg transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600"/>
                Pencarian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input placeholder="Masukkan kata kunci pencarian..." value={searchTerm} onChange={function (e) { return handleSearchTermChange(e.target.value); }} className="w-full"/>
                </div>
                <div className="flex gap-2">
                  <Button variant={searchType === "name" ? "default" : "outline"} onClick={function () { return setSearchType("name"); }} className="flex-1 md:flex-none">
                    <Users className="h-4 w-4 mr-2"/>
                    Nama
                  </Button>
                  <Button variant={searchType === "medicalRecord" ? "default" : "outline"} onClick={function () { return setSearchType("medicalRecord"); }} className="flex-1 md:flex-none">
                    <FileText className="h-4 w-4 mr-2"/>
                    No. RM
                  </Button>
                  <Button variant={searchType === "action" ? "default" : "outline"} onClick={function () { return setSearchType("action"); }} className="flex-1 md:flex-none">
                    <FileText className="h-4 w-4 mr-2"/>
                    Tindakan
                  </Button>
                </div>
              </div>
              {!shouldFetch && searchTerm.length > 0 && (<p className="text-sm text-gray-500 mt-2">Ketik minimal 2 karakter untuk mencari</p>)}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}>
          <Card className="hover:shadow-lg transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600"/>
                  Hasil Pencarian
                </span>
                {shouldFetch && filteredEntries && (<Badge variant="outline" className="ml-2">
                    {filteredEntries.length} hasil
                  </Badge>)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (<div className="space-y-4">
                  {[1, 2, 3].map(function (i) { return (<div key={i} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-4 w-20"/>
                      <Skeleton className="h-4 w-24"/>
                      <Skeleton className="h-4 w-16"/>
                      <Skeleton className="h-4 w-20"/>
                      <Skeleton className="h-4 w-16"/>
                    </div>); })}
                </div>) : shouldFetch ? (filteredEntries.length > 0 ? (<div className="space-y-4 overflow-x-auto">
                    {/* Table Header */}
                    <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg font-medium text-sm text-gray-600 dark:text-gray-300 min-w-[800px]">
                      <div>Tanggal</div>
                      <div>Nama Pasien</div>
                      <div>No. RM</div>
                      <div>Tindakan</div>
                      <div>Biaya</div>
                      <div>Lainnya</div>
                    </div>
                    
                    {/* Table Content */}
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {filteredEntries.map(function (entry) { return (<div key={entry.id} className="grid grid-cols-6 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors items-center min-w-[800px]" onClick={function () { return window.location.href = "/data-harian?edit=".concat(entry.id); }} style={{ cursor: 'pointer' }}>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(entry.date).toLocaleDateString('id-ID')}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {entry.patientName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {entry.gender}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.medicalRecordNumber}
                          </div>
                          <div className="flex flex-wrap gap-1 max-w-[120px]">
                            {Array.isArray(entry.actions) && entry.actions.map(function (action, index) { return (<Badge key={index} variant="secondary" className="text-xs mb-1">
                                {actionLabels[action] || action}
                              </Badge>); })}
                          </div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            <Badge variant={entry.paymentType === 'BPJS' ? 'default' : 'secondary'}>
                              {entry.paymentType}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {entry.otherActions || '-'}
                          </div>
                        </div>); })}
                    </div>
                  </div>) : (<div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Tidak ada hasil yang ditemukan
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Coba kata kunci lain atau ubah tipe pencarian
                    </p>
                  </div>)) : (<div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Masukkan kata kunci untuk mencari
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Hasil pencarian akan muncul di sini
                  </p>
                </div>)}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>);
}
