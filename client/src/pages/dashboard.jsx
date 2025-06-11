var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Edit, Trash2, UserCheck, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
var COLORS = ['#0066CC', '#4A90E2', '#22C55E', '#F59E0B', '#EF4444'];
var actionLabels = {
    obat: 'Obat',
    'cabut-anak': 'Cabut anak',
    'cabut-dewasa': 'Cabut dewasa',
    'tambal-sementara': 'Tambal Sementara',
    'tambal-tetap': 'Tambal Tetap',
    scaling: 'Scaling',
    rujuk: 'Rujuk'
};
export default function Dashboard() {
    var _this = this;
    var _a = useState(format(new Date(), 'yyyy-MM-dd')), selectedDate = _a[0], setSelectedDate = _a[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _b = useQuery({
        queryKey: ["/api/statistics"],
        refetchInterval: 5000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    }), stats = _b.data, isLoading = _b.isLoading, error = _b.error;
    var entries = useQuery({
        queryKey: ["/api/data-entries"],
        queryFn: function () { return apiRequest("GET", "/api/data-entries").then(function (res) { return res.json(); }); },
        refetchInterval: 5000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    }).data;
    var _c = useQuery({
        queryKey: ["/api/daily-visits", selectedDate],
        queryFn: function () { return apiRequest("GET", "/api/daily-visits?date=".concat(selectedDate)).then(function (res) { return res.json(); }); },
        refetchInterval: 2000, // Refresh every 2 seconds for better real-time updates
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    }), dailyVisits = _c.data, isLoadingVisits = _c.isLoading;
    var deleteMutation = useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            var entryToDelete, response, mappedFormObject_1, sheetsResponse, sheetsData, sheetError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entryToDelete = dailyVisits === null || dailyVisits === void 0 ? void 0 : dailyVisits.find(function (visit) { return visit.id === id; });
                        return [4 /*yield*/, apiRequest("DELETE", "/api/data-entries/".concat(id))];
                    case 1:
                        response = _a.sent();
                        if (!(response.ok && entryToDelete)) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        mappedFormObject_1 = {
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
                        Object.keys(actionLabels).forEach(function (actionId) {
                            if (entryToDelete.actions && entryToDelete.actions.includes(actionId)) {
                                mappedFormObject_1[actionLabels[actionId]] = "Yes";
                            }
                            else {
                                mappedFormObject_1[actionLabels[actionId]] = "No";
                            }
                        });
                        return [4 /*yield*/, fetch("https://script.google.com/macros/s/AKfycbxnyacmLOW4Ts93_S56wLJj1i4eT76sm1SvJhXu8w-MAmyAtj9DPtoaY28mvD9OkmD2/exec", {
                                method: "POST",
                                body: new URLSearchParams(Object.entries(mappedFormObject_1).reduce(function (acc, _a) {
                                    var _b;
                                    var key = _a[0], value = _a[1];
                                    return (__assign(__assign({}, acc), (_b = {}, _b[key] = value !== null && value !== void 0 ? value : '', _b)));
                                }, {})),
                                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            })];
                    case 3:
                        sheetsResponse = _a.sent();
                        return [4 /*yield*/, sheetsResponse.json()];
                    case 4:
                        sheetsData = _a.sent();
                        if (sheetsData.result !== "success") {
                            console.error("Gagal menghapus data dari Google Sheets:", sheetsData.message);
                            toast({
                                title: "Error",
                                description: "Gagal menghapus data dari Google Sheets",
                                variant: "destructive"
                            });
                        }
                        else {
                            console.log("Data berhasil dihapus dari Google Sheets");
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        sheetError_1 = _a.sent();
                        console.error("Error saat menghapus dari Google Sheets:", sheetError_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
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
        onError: function () {
            toast({
                title: "Error",
                description: "Gagal menghapus data",
                variant: "destructive",
            });
        },
    });
    if (error) {
        return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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
      </div>);
    }
    var statCards = [
        {
            title: "Total Laki-laki",
            subtitle: "keseluruhan",
            value: isLoading || !entries ? 0 : entries.filter(function (entry) { return entry.gender && entry.gender.trim().toLowerCase() === 'laki-laki'; }).length,
            icon: Users,
            color: "blue"
        },
        {
            title: "Total Perempuan",
            subtitle: "keseluruhan",
            value: isLoading || !entries ? 0 : entries.filter(function (entry) { return entry.gender && entry.gender.trim().toLowerCase() === 'perempuan'; }).length,
            icon: UserCheck,
            color: "pink"
        },
        {
            title: "Kunjungan Harian",
            subtitle: "rata-rata",
            value: (stats === null || stats === void 0 ? void 0 : stats.dailyAverage) || 0,
            icon: Calendar,
            color: "green"
        },
        {
            title: "Total Semua Pasien",
            subtitle: "keseluruhan",
            value: (stats === null || stats === void 0 ? void 0 : stats.totalPatients) || 0,
            icon: BarChart3,
            color: "purple"
        }
    ];
    // Prepare data for charts
    var trafficChartData = (stats === null || stats === void 0 ? void 0 : stats.trafficData) || [];
    // Ensure male and female data are properly displayed in the traffic chart
    if (trafficChartData.length > 0) {
        trafficChartData.forEach(function (data) {
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
    var pieChartData = (stats === null || stats === void 0 ? void 0 : stats.actionDistribution) ?
        Object.entries(stats.actionDistribution).map(function (_a) {
            var key = _a[0], value = _a[1];
            return ({
                name: actionLabels[key] || key,
                value: value
            });
        }) : [];
    var paymentPieData = [
        { name: 'BPJS', value: (stats === null || stats === void 0 ? void 0 : stats.bpjsCount) || 0 },
        { name: 'UMUM', value: (stats === null || stats === void 0 ? void 0 : stats.umumCount) || 0 }
    ];
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="mb-6 sm:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ringkasan aktivitas praktek hari ini
          </p>
        </motion.div>

        {/* Daily Visits Section - Moved to Top */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }} className="mb-6 sm:mb-8">
          <Card className="hover:shadow-lg transition-all duration-500">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600"/>
                  Kunjungan Harian
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <label htmlFor="date-picker" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tanggal:
                  </label>
                  <Input id="date-picker" type="date" value={selectedDate} onChange={function (e) { return setSelectedDate(e.target.value); }} className="w-auto"/>
                  <Button variant="outline" className="flex items-center gap-2 ml-2" onClick={function () { return window.location.href = '/search-patient'; }}>
                    <Users className="h-4 w-4"/>
                    Cari Data Pasien
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingVisits ? (<div className="space-y-4">
                  {[1, 2, 3].map(function (i) { return (<div key={i} className="grid grid-cols-7 gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-4 w-20"/>
                      <Skeleton className="h-4 w-24"/>
                      <Skeleton className="h-4 w-16"/>
                      <Skeleton className="h-4 w-20"/>
                      <Skeleton className="h-4 w-16"/>
                      <Skeleton className="h-4 w-20"/>
                      <Skeleton className="h-8 w-20"/>
                    </div>); })}
                </div>) : dailyVisits && dailyVisits.length > 0 ? (<div className="space-y-4 overflow-x-auto">
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
                    {dailyVisits.map(function (visit) { return (<div key={visit.id} className="grid grid-cols-7 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors items-center min-w-[800px]">
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
                          {visit.actions.map(function (action, index) { return (<Badge key={index} variant="secondary" className="text-xs mb-1">
                              {actionLabels[action] || action}
                            </Badge>); })}
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
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={function () {
                    // Redirect ke halaman edit dengan ID data
                    window.location.href = "/data-harian?edit=".concat(visit.id);
                }}>
                            <Edit className="h-3 w-3"/>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={function () { return deleteMutation.mutate(visit.id); }}>
                            <Trash2 className="h-3 w-3"/>
                          </Button>
                        </div>
                      </div>); })}
                  </div>
                </div>) : (<div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Tidak ada kunjungan pada tanggal ini
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Pilih tanggal lain atau tambahkan data baru
                  </p>
                </div>)}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map(function (stat, index) { return (<motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 + index * 0.05, ease: "easeOut" }} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
              <Card className="hover:shadow-lg transition-all duration-500 hover:border-blue-200">
                <CardContent className="p-4 sm:p-6">
                  {isLoading ? (<div className="space-y-3">
                      <Skeleton className="h-4 w-20"/>
                      <Skeleton className="h-8 w-16"/>
                      <Skeleton className="h-3 w-24"/>
                    </div>) : (<>
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
                        <motion.div className={"p-3 rounded-full ".concat(stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                    stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                            stat.color === 'pink' ? 'bg-pink-100 dark:bg-pink-900' :
                                'bg-purple-100 dark:bg-purple-900')} whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                          <stat.icon className={"h-5 w-5 ".concat(stat.color === 'blue' ? 'text-blue-600 dark:text-blue-300' :
                    stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-300' :
                        stat.color === 'green' ? 'text-green-600 dark:text-green-300' :
                            stat.color === 'pink' ? 'text-pink-600 dark:text-pink-300' :
                                'text-purple-600 dark:text-purple-300')}/>
                        </motion.div>
                      </div>
                    </>)}
                </CardContent>
              </Card>
            </motion.div>); })}
        </motion.div>

        {/* Charts Grid - Distribution Charts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }} className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <Card className="hover:shadow-lg transition-all duration-500 hover:border-blue-200">
            <CardHeader>
              <CardTitle>Distribusi Tindakan</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (<Skeleton className="w-full h-64"/>) : (<ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" animationDuration={1000} animationEasing="ease-out">
                      {pieChartData.map(function (entry, index) { return (<Cell key={"cell-".concat(index)} fill={COLORS[index % COLORS.length]}/>); })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>)}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-500 hover:border-blue-200">
            <CardHeader>
              <CardTitle>Distribusi Biaya</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (<Skeleton className="w-full h-64"/>) : (<ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={paymentPieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" animationDuration={1000} animationEasing="ease-out">
                      {paymentPieData.map(function (entry, index) { return (<Cell key={"cell-".concat(index)} fill={index === 0 ? '#22C55E' : '#4A90E2'}/>); })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>)}
            </CardContent>
          </Card>
        </motion.div>

        {/* Traffic Chart - Full Width at Bottom */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}>
          <Card className="hover:shadow-lg transition-all duration-500 hover:border-blue-200">
            <CardHeader>
              <CardTitle>Traffic Kunjungan Pasien</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {isLoading ? (<Skeleton className="w-full h-96"/>) : (<div className="min-w-[600px]">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={trafficChartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                      <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={{ stroke: '#9ca3af' }} axisLine={{ stroke: '#9ca3af' }}/>
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={{ stroke: '#9ca3af' }} axisLine={{ stroke: '#9ca3af' }}/>
                      <Tooltip contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e5e7eb'
            }} labelStyle={{ fontWeight: 'bold', color: '#111827' }}/>
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingTop: '10px' }}/>
                      <Line type="monotone" dataKey="male" stroke="#3b82f6" name="Laki-laki" strokeWidth={3} isAnimationActive={true} animationDuration={1800} animationEasing="ease-in-out" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 7, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}/>
                      <Line type="monotone" dataKey="female" stroke="#ec4899" name="Perempuan" strokeWidth={3} isAnimationActive={true} animationDuration={1800} animationEasing="ease-in-out" dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 7, fill: '#ec4899', stroke: '#ffffff', strokeWidth: 2 }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>)}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>);
}
