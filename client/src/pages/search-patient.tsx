import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Users, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import type { DataEntry } from "@shared/schema";

const actionLabels: Record<string, string> = {
  obat: 'Obat',
  'cabut-anak': 'Cabut anak',
  'cabut-dewasa': 'Cabut dewasa',
  'tambal-sementara': 'Tambal Sementara',
  'tambal-tetap': 'Tambal Tetap',
  scaling: 'Scaling',
  rujuk: 'Rujuk'
};

export default function SearchPatient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"name" | "medicalRecord" | "action">("name");
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term to reduce API calls
  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    // Clear previous timeout
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  };

  // Only fetch data when actually searching
  const shouldFetch = debouncedSearchTerm.length >= 2; // Only search with 2+ characters

  // Fetch entries based on search parameters
  const { data: entries, isLoading } = useQuery<DataEntry[]>({
    queryKey: ["/api/data-entries", searchType, debouncedSearchTerm],
    queryFn: async () => {
      if (!shouldFetch) return [];
      
      // Construct query parameters
      const params = new URLSearchParams();
      if (searchType === "name") params.append("name", debouncedSearchTerm);
      if (searchType === "medicalRecord") params.append("medicalRecord", debouncedSearchTerm);
      if (searchType === "action") params.append("action", debouncedSearchTerm);
      
      const response = await apiRequest("GET", `/api/data-entries?${params.toString()}`);
      return response.json();
    },
    enabled: shouldFetch, // Only run query when search term is valid
    staleTime: 30000, // Cache results for 30 seconds
  });

  // Filter entries client-side for immediate feedback
  const filteredEntries = entries || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => window.location.href = '/dashboard'}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mb-6 sm:mb-8"
        >
          <Card className="hover:shadow-lg transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Pencarian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Masukkan kata kunci pencarian..."
                    value={searchTerm}
                    onChange={(e) => handleSearchTermChange(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={searchType === "name" ? "default" : "outline"}
                    onClick={() => setSearchType("name")}
                    className="flex-1 md:flex-none"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Nama
                  </Button>
                  <Button
                    variant={searchType === "medicalRecord" ? "default" : "outline"}
                    onClick={() => setSearchType("medicalRecord")}
                    className="flex-1 md:flex-none"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    No. RM
                  </Button>
                  <Button
                    variant={searchType === "action" ? "default" : "outline"}
                    onClick={() => setSearchType("action")}
                    className="flex-1 md:flex-none"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Tindakan
                  </Button>
                </div>
              </div>
              {!shouldFetch && searchTerm.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">Ketik minimal 2 karakter untuk mencari</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <Card className="hover:shadow-lg transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Hasil Pencarian
                </span>
                {shouldFetch && filteredEntries && (
                  <Badge variant="outline" className="ml-2">
                    {filteredEntries.length} hasil
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : shouldFetch ? (
                filteredEntries.length > 0 ? (
                  <div className="space-y-4 overflow-x-auto">
                    {/* Table Header */}
                    <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg font-medium text-sm text-gray-600 dark:text-gray-300 min-w-[900px]">
                      <div>Tanggal</div>
                      <div>Nama Pasien</div>
                      <div>No. RM</div>
                      <div>Tindakan</div>
                      <div>Biaya</div>
                      <div>Lainnya</div>
                    </div>
                    
                    {/* Table Content */}
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {filteredEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="grid grid-cols-6 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors items-center min-w-[900px]"
                          onClick={() => window.location.href = `/data-harian?edit=${entry.id}`}
                          style={{ cursor: 'pointer' }}
                        >
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
                            {entry.actions.map((action, index) => (
                              <Badge key={index} variant="secondary" className="text-xs mb-1">
                                {actionLabels[action] || action}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            <Badge variant={entry.paymentType === 'BPJS' ? 'default' : 'secondary'}>
                              {entry.paymentType}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {/* Konsisten dengan Dashboard: tampilkan '-' jika kosong */}
                            {entry.otherActions && entry.otherActions.trim() !== '' ? entry.otherActions : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Tidak ada hasil yang ditemukan
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Coba kata kunci lain atau ubah tipe pencarian
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Masukkan kata kunci untuk mencari
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Hasil pencarian akan muncul di sini
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}