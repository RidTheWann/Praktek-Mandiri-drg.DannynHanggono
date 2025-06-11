
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar,
  Edit,
  Trash2,
  UserCheck,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DataEntry } from "@shared/schema";

interface Statistics {
  maleMonthly: number;
  femaleMonthly: number;
  dailyAverage: number;
  bpjsCount: number;
  umumCount: number;
  totalPatients: number;
  trafficData: Array<{ date: string; male: number; female: number }>;
  actionDistribution: Record<string, number>;
}

const COLORS = ['#0066CC', '#4A90E2', '#22C55E', '#F59E0B', '#EF4444'];

const actionLabels: Record<string, string> = {
  obat: 'Obat',
  'cabut-anak': 'Cabut anak',
  'cabut-dewasa': 'Cabut dewasa',
  'tambal-sementara': 'Tambal Sementara',
  'tambal-tetap': 'Tambal Tetap',
  scaling: 'Scaling',
  rujuk: 'Rujuk'
};

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: stats, isLoading, error } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: entries } = useQuery<DataEntry[]>({
    queryKey: ["/api/data-entries"],
    queryFn: () => apiRequest("GET", `/api/data-entries`).then(res => res.json()),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: dailyVisits, isLoading: isLoadingVisits } = useQuery<DataEntry[]>({
    queryKey: ["/api/daily-visits", selectedDate],
    queryFn: () => apiRequest("GET", `/api/daily-visits?date=${selectedDate}`).then(res => res.json()),
    refetchInterval: 2000, // Refresh every 2 seconds for better real-time updates
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // Pertama, dapatkan data entry yang akan dihapus untuk dikirim ke Google Sheets
      const entryToDelete = dailyVisits?.find(visit => visit.id === id);
      
      // Hapus dari database lokal
      const response = await apiRequest("DELETE", `/api/data-entries/${id}`);
      
      // Jika berhasil dihapus dari database dan data entry ditemukan, hapus juga dari Google Sheets
      if (response.ok && entryToDelete) {
        try {
          // Mapping data untuk dikirim ke Google Sheets dengan flag delete
          // Pastikan menggunakan No.Antrean sebagai ID untuk Google Sheets
          const mappedFormObject: { [key: string]: string | undefined } = {
            "action": "delete",
            "id": entryToDelete.id.toString(), // Using entry ID as identifier for Google Sheets
            "Tanggal Kunjungan": entryToDelete.date,
            "Nama Pasien": entryToDelete.patientName,
            "No.RM": entryToDelete.medicalRecordNumber,
            "Kelamin": entryToDelete.gender,
            "Biaya": entryToDelete.paymentType,
            "Lainnya": entryToDelete.otherActions || ""
          };

          // Add selected actions to mappedFormObject
          Object.keys(actionLabels).forEach(actionId => {
            if (entryToDelete.actions && entryToDelete.actions.includes(actionId)) {
              mappedFormObject[actionLabels[actionId]] = "Yes";
            } else {
              mappedFormObject[actionLabels[actionId]] = "No";
            }
          });
      
          // Kirim data ke Google Sheets menggunakan Apps Script
          const sheetsResponse = await fetch(
            "https://script.google.com/macros/s/AKfycbxnyacmLOW4Ts93_S56wLJj1i4eT76sm1SvJhXu8w-MAmyAtj9DPtoaY28mvD9OkmD2/exec",
            {
              method: "POST",
              body: new URLSearchParams(Object.entries(mappedFormObject).reduce((acc, [key, value]) => ({
                ...acc,
                [key]: value ?? ''
              }), {} as Record<string, string>)),
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
          );
      
          const sheetsData = await sheetsResponse.json();
          if (sheetsData.result !== "success") {
            console.error("Gagal menghapus data dari Google Sheets:", sheetsData.message);
            toast({
              title: "Error",
              description: "Gagal menghapus data dari Google Sheets",
              variant: "destructive"
            });
          } else {
            console.log("Data berhasil dihapus dari Google Sheets");
          }
        } catch (sheetError) {
          console.error("Error saat menghapus dari Google Sheets:", sheetError);
        }
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sukses!",
        description: "Data berhasil dihapus dari database dan Google Sheets",
      });
      // Force refresh all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/daily-visits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      queryClient.refetchQueries({ queryKey: ["/api/daily-visits", selectedDate] });
      queryClient.refetchQueries({ queryKey: ["/api/statistics"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus data",
        variant: "destructive",
      });
    },
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">
                Gagal memuat data dashboard
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Silakan refresh halaman atau coba lagi nanti
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Laki-laki",
      subtitle: "keseluruhan",
      value: isLoading || !entries ? 0 : entries.filter(entry => entry.gender && entry.gender.trim().toLowerCase() === 'laki-laki').length,
      icon: Users,
      color: "blue"
    },
    {
      title: "Total Perempuan", 
      subtitle: "keseluruhan",
      value: isLoading || !entries ? 0 : entries.filter(entry => entry.gender && entry.gender.trim().toLowerCase() === 'perempuan').length,
      icon: UserCheck,
      color: "pink"
    },
    {
      title: "Kunjungan Harian",
      subtitle: "rata-rata",
      value: stats?.dailyAverage || 0,
      icon: Calendar,
      color: "green"
    },
    {
      title: "Total Semua Pasien",
      subtitle: "keseluruhan",
      value: stats?.totalPatients || 0,
      icon: BarChart3,
      color: "purple"
    }
  ];

  // Prepare data for charts
  const trafficChartData = stats?.trafficData || [];
  
  // Ensure male and female data are properly displayed in the traffic chart
  if (trafficChartData.length > 0) {
    trafficChartData.forEach(data => {
      if (data.male === undefined || data.male === null) {
        data.male = 0;
      }
      if (data.female === undefined || data.female === null) {
        data.female = 0;
      }
      // Ensure data is properly formatted for display
      data.male = Number(data.male);
      data.female = Number(data.female);
    });
  }
  const pieChartData = stats?.actionDistribution ? 
    Object.entries(stats.actionDistribution).map(([key, value]) => ({
      name: actionLabels[key] || key,
      value: value
    })) : [];

  const paymentPieData = [
    { name: 'BPJS', value: stats?.bpjsCount || 0 },
    { name: 'UMUM', value: stats?.umumCount || 0 }
  ];

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ringkasan aktivitas praktek hari ini
          </p>
        </motion.div>

        {/* Daily Visits Section - Moved to Top */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mb-6 sm:mb-8"
        >
          <Card className="hover:shadow-lg transition-all duration-500">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Kunjungan Harian
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <label htmlFor="date-picker" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tanggal:
                  </label>
                  <Input
                    id="date-picker"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 ml-2"
                    onClick={() => window.location.href = '/search-patient'}
                  >
                    <Users className="h-4 w-4" />
                    Cari Data Pasien
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingVisits ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-7 gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : dailyVisits && dailyVisits.length > 0 ? (
                <div className="space-y-4 overflow-x-auto">
                  {/* Table Header */}
                  <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg font-medium text-sm text-gray-600 dark:text-gray-300 min-w-[800px]">
                    <div>Tanggal</div>
                    <div>Nama Pasien</div>
                    <div>No. RM</div>
                    <div>Tindakan</div>
                    <div>Biaya</div>
                    <div>Lainnya</div>
                    <div>Aksi</div>
                  </div>
                  
                  {/* Table Content */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {dailyVisits.map((visit) => (
                      <div
                        key={visit.id}
                        className="grid grid-cols-7 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors items-center min-w-[800px]"
                      >
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(visit.date).toLocaleDateString('id-ID')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {visit.patientName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {visit.gender}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {visit.medicalRecordNumber}
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {visit.actions.map((action, index) => (
                            <Badge key={index} variant="secondary" className="text-xs mb-1">
                              {actionLabels[action] || action}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          <Badge variant={visit.paymentType === 'BPJS' ? 'default' : 'secondary'}>
                            {visit.paymentType}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {visit.otherActions || '-'}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              // Redirect ke halaman edit dengan ID data
                              window.location.href = `/data-harian?edit=${visit.id}`;
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => deleteMutation.mutate(visit.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Tidak ada kunjungan pada tanggal ini
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Pilih tanggal lain atau tambahkan data baru
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.05, ease: "easeOut" }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="hover:shadow-lg transition-all duration-500 hover:border-blue-200">
                <CardContent className="p-4 sm:p-6">
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {stat.title}
                          </p>
                          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {stat.value}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {stat.subtitle}
                          </p>
                        </div>
                        <motion.div 
                          className={`p-3 rounded-full ${
                            stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                            stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900' :
                            stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                            stat.color === 'pink' ? 'bg-pink-100 dark:bg-pink-900' :
                            'bg-purple-100 dark:bg-purple-900'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <stat.icon className={`h-5 w-5 ${
                            stat.color === 'blue' ? 'text-blue-600 dark:text-blue-300' :
                            stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-300' :
                            stat.color === 'green' ? 'text-green-600 dark:text-green-300' :
                            stat.color === 'pink' ? 'text-pink-600 dark:text-pink-300' :
                            'text-purple-600 dark:text-purple-300'
                          }`} />
                        </motion.div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Grid - Distribution Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8"
        >
          <Card className="hover:shadow-lg transition-all duration-500 hover:border-blue-200">
            <CardHeader>
              <CardTitle>Distribusi Tindakan</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-64" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-500 hover:border-blue-200">
            <CardHeader>
              <CardTitle>Distribusi Biaya</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-64" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {paymentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#22C55E' : '#4A90E2'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Traffic Chart - Full Width at Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <Card className="hover:shadow-lg transition-all duration-500 hover:border-blue-200">
            <CardHeader>
              <CardTitle>Traffic Kunjungan Pasien</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {isLoading ? (
                <Skeleton className="w-full h-96" />
              ) : (
                <div className="min-w-[600px]">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart 
                      data={trafficChartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickLine={{ stroke: '#9ca3af' }}
                        axisLine={{ stroke: '#9ca3af' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickLine={{ stroke: '#9ca3af' }}
                        axisLine={{ stroke: '#9ca3af' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          border: '1px solid #e5e7eb'
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '10px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="male" 
                        stroke="#3b82f6" 
                        name="Laki-laki" 
                        strokeWidth={3} 
                        isAnimationActive={true}
                        animationDuration={1800}
                        animationEasing="ease-in-out"
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 7, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="female" 
                        stroke="#ec4899" 
                        name="Perempuan" 
                        strokeWidth={3} 
                        isAnimationActive={true}
                        animationDuration={1800}
                        animationEasing="ease-in-out"
                        dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 7, fill: '#ec4899', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
