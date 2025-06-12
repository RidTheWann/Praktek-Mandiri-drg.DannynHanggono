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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect } from "react";
import { format } from 'date-fns';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { motion } from "framer-motion";
import { CalendarPlus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { web3Provider } from "@/lib/web3";
import { getUrlParams } from "@/lib/simple-router";
import { handleApiError } from "@/lib/api-helper";

const formSchema = z.object({
    date: z.string().min(1, "Tanggal harus diisi"),
    patientName: z.string().min(1, "Nama pasien harus diisi"),
    medicalRecordNumber: z.string().min(1, "No. RM harus diisi"),
    gender: z.enum(["Laki-laki", "Perempuan"], { required_error: "Pilih jenis kelamin" }),
    paymentType: z.enum(["BPJS", "UMUM"], { required_error: "Pilih jenis pembayaran" }),
    actions: z.array(z.string()).optional(),
    otherActions: z.string().optional(),
    description: z.string().optional(),
}).refine(function (data) {
    return (data.actions && data.actions.length > 0) || (data.otherActions && data.otherActions.trim() !== "");
}, {
    message: "Wajib mengisi minimal satu Tindakan atau Tindakan Lainnya",
    path: ["actions"],
});

const actionOptions = [
    { id: "obat", label: "Obat" },
    { id: "cabut-anak", label: "Cabut Anak" },
    { id: "cabut-dewasa", label: "Cabut Dewasa" },
    { id: "tambal-sementara", label: "Tambal Sementara" },
    { id: "tambal-tetap", label: "Tambal Tetap" },
    { id: "scaling", label: "Scaling" },
    { id: "rujuk", label: "Rujuk" },
];

export default function DataHarian() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Get URL parameters to check for edit mode
    const urlParams = getUrlParams();
    const editId = urlParams.edit ? parseInt(urlParams.edit) : null;
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: format(new Date(), 'yyyy-MM-dd'),
            patientName: "",
            medicalRecordNumber: "",
            gender: undefined,
            paymentType: undefined,
            actions: [],
            otherActions: "",
            description: "",
        },
    });
    
    // Load data if in edit mode
    useEffect(() => {
        if (editId) {
            const loadEditData = async () => {
                try {
                    // Fetch all entries first
                    const response = await apiRequest("GET", "/api/data-entries");
                    const entries = await response.json();
                    
                    if (entries && entries.length > 0) {
                        // Find the specific entry by ID
                        const entry = entries.find(e => e.id === editId);
                        
                        if (entry) {
                            form.reset({
                                date: entry.date,
                                patientName: entry.patientName,
                                medicalRecordNumber: entry.medicalRecordNumber,
                                gender: entry.gender,
                                paymentType: entry.paymentType,
                                actions: entry.actions || [],
                                otherActions: entry.otherActions || "",
                                description: entry.description || "",
                            });
                        } else {
                            toast({
                                title: "Error",
                                description: "Data yang ingin diedit tidak ditemukan",
                                variant: "destructive",
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error loading edit data:", error);
                    toast({
                        title: "Error",
                        description: "Gagal memuat data untuk diedit",
                        variant: "destructive",
                    });
                }
            };
            
            loadEditData();
        }
    }, [editId, form, toast]);

    const submitMutation = useMutation({
        mutationFn: function (data) { return __awaiter(this, void 0, void 0, function () {
            var apiMethod, apiUrl, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsSubmitting(true);
                        
                        // Determine API method and URL based on edit mode
                        apiMethod = editId ? "PUT" : "POST";
                        apiUrl = editId ? `/api/data-entries?id=${editId}` : "/api/data-entries";
                        
                        return [4 /*yield*/, apiRequest(apiMethod, apiUrl, data)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); },
        onSuccess: function () {
            clearForm();
            toast({
                title: "Sukses",
                description: editId ? "Data berhasil diperbarui" : "Data berhasil disimpan",
            });
            
            // Force refresh all dashboard queries
            queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
            queryClient.invalidateQueries({ queryKey: ["/api/daily-visits"] });
            queryClient.refetchQueries({ queryKey: ["/api/statistics"] });
            queryClient.refetchQueries({ queryKey: ["/api/daily-visits"] });
            
            // Clear edit mode from URL if applicable
            if (editId) {
                window.history.replaceState({}, '', '/data-harian');
            }
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: "Gagal menyimpan data. Silakan coba lagi.",
                variant: "destructive",
            });
            console.error("Submission error:", error);
            handleApiError(error, toast);
        },
        onSettled: function () {
            setIsSubmitting(false);
        },
    });

    const onSubmit = function (data) {
        console.log("Submitting form data for edit/add:", JSON.stringify(data, null, 2));
        
        // Validate that either actions or otherActions is filled
        if ((!data.actions || data.actions.length === 0) && (!data.otherActions || data.otherActions.trim() === "")) {
            toast({
                title: "Error",
                description: "Wajib mengisi minimal satu Tindakan atau Tindakan Lainnya",
                variant: "destructive",
            });
            return;
        }
        
        submitMutation.mutate(data);
    };

    const clearForm = function () {
        // Reset form fields
        form.reset({
            date: new Date().toISOString().split('T')[0],
            patientName: "",
            medicalRecordNumber: "",
            gender: undefined,
            paymentType: undefined,
            actions: [],
            otherActions: "",
            description: "",
        });
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-500">
                        <CardContent className="p-5 md:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                        {editId ? "Edit Data Pasien" : "Input Data Harian"}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        Catat tindakan medis dan rujukan hari ini
                                    </p>
                                </div>
                                <motion.div className="text-blue-600 text-3xl self-start sm:self-auto" whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                                    <CalendarPlus className="h-8 w-8"/>
                                </motion.div>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-prevent-refresh="true">
                                    {/* Date Field */}
                                    <FormField control={form.control} name="date" render={function (_a) {
                                        var field = _a.field;
                                        return (<FormItem>
                                            <FormLabel>
                                                Tanggal <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="focus:ring-2 focus:ring-blue-500 transition-all duration-300"/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>);
                                    }}/>

                                    {/* Patient Information Section */}
                                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                        {/* Patient Name */}
                                        <FormField control={form.control} name="patientName" render={function (_a) {
                                            var field = _a.field;
                                            return (<FormItem>
                                                <FormLabel>
                                                    Nama Pasien <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Masukkan nama lengkap pasien" {...field} className="focus:ring-2 focus:ring-blue-500 transition-all duration-300"/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>);
                                        }}/>

                                        {/* Medical Record Number */}
                                        <FormField control={form.control} name="medicalRecordNumber" render={function (_a) {
                                            var field = _a.field;
                                            return (<FormItem>
                                                <FormLabel>
                                                    No. RM <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Contoh : 00.00.00" {...field} className="focus:ring-2 focus:ring-blue-500 transition-all duration-300"/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>);
                                        }}/>

                                        {/* Gender */}
                                        <FormField control={form.control} name="gender" render={function (_a) {
                                            var field = _a.field;
                                            return (<FormItem>
                                                <FormLabel>
                                                    Kelamin <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger className="focus:ring-2 focus:ring-blue-500 transition-all duration-300">
                                                            <SelectValue placeholder="Pilih jenis kelamin"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>);
                                        }}/>

                                        {/* Payment Type */}
                                        <FormField control={form.control} name="paymentType" render={function (_a) {
                                            var field = _a.field;
                                            return (<FormItem>
                                                <FormLabel>
                                                    Biaya <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger className="focus:ring-2 focus:ring-blue-500 transition-all duration-300">
                                                            <SelectValue placeholder="Pilih jenis pembayaran"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="BPJS">BPJS</SelectItem>
                                                        <SelectItem value="UMUM">UMUM</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>);
                                        }}/>
                                    </div>

                                    {/* Actions Checkboxes */}
                                    <FormField control={form.control} name="actions" render={function () { return (<FormItem>
                                        <FormLabel>
                                            Tindakan <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                                            {actionOptions.map(function (option) { return (<FormField key={option.id} control={form.control} name="actions" render={function (_a) {
                                                var _b, _c;
                                                var field = _a.field;
                                                return (<FormItem className="flex flex-row items-center space-x-0 space-y-0">
                                                    <FormControl>
                                                        <Checkbox id={option.id} checked={(_b = field.value) === null || _b === void 0 ? void 0 : _b.includes(option.id)} onCheckedChange={function (checked) {
                                                            var _a;
                                                            return checked
                                                                ? field.onChange(__spreadArray(__spreadArray([], (field.value || []), true), [option.id], false))
                                                                : field.onChange((_a = field.value) === null || _a === void 0 ? void 0 : _a.filter(function (value) { return value !== option.id; }));
                                                        }} className="sr-only"/>
                                                    </FormControl>
                                                    <FormLabel htmlFor={option.id} className={"flex-1 px-3 py-2 text-center border rounded-md cursor-pointer transition-all duration-300 text-sm font-medium ".concat(((_c = field.value) === null || _c === void 0 ? void 0 : _c.includes(option.id))
                                                        ? "bg-blue-600 text-white border-blue-600 transform scale-105"
                                                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300")}>
                                                        {option.label}
                                                    </FormLabel>
                                                </FormItem>);
                                            }}/>); })}
                                        </div>
                                        <FormMessage />
                                    </FormItem>); }}/>

                                    {/* Other Actions */}
                                    <FormField control={form.control} name="otherActions" render={function (_a) {
                                        var field = _a.field;
                                        return (<FormItem>
                                            <FormLabel>
                                                Tindakan Lainnya <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Sebutkan tindakan lainnya..." {...field} className="focus:ring-2 focus:ring-blue-500 transition-all duration-300"/>
                                            </FormControl>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                * Pilih minimal satu tindakan di atas atau isi tindakan lainnya
                                            </p>
                                            <FormMessage />
                                        </FormItem>);
                                    }}/>

                                    {/* Action Buttons */}
                                    <motion.div className="flex justify-center pt-4 sm:pt-6 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg transition-all duration-300 hover:shadow-lg flex items-center">
                                                <Save className="mr-2 h-4 w-4"/>
                                                {isSubmitting ? "Menyimpan..." : (editId ? "Update Data" : "Submit Data")}
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </main>
    );
}