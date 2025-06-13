import { useState, useEffect } from "react";
import { format } from 'date-fns';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { motion } from "framer-motion";
import { CalendarPlus, Save, RotateCcw } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { web3Provider } from "@/lib/web3";

const formSchema = z.object({
  date: z.string().min(1, "Tanggal harus diisi"),
  patientName: z.string().min(1, "Nama pasien harus diisi"),
  medicalRecordNumber: z.string().min(1, "No. RM harus diisi"),
  gender: z.enum(["Laki-laki", "Perempuan"], { required_error: "Pilih jenis kelamin" }),
  paymentType: z.enum(["BPJS", "UMUM"], { required_error: "Pilih jenis pembayaran" }),
  actions: z.array(z.string()).optional(),
  otherActions: z.string().optional(),
  description: z.string().optional(),
}).refine((data) => {
  return (data.actions && data.actions.length > 0) || (data.otherActions && data.otherActions.trim() !== "");
}, {
  message: "Wajib mengisi minimal satu Tindakan atau Tindakan Lainnya",
  path: ["actions"],
});

type FormData = z.infer<typeof formSchema>;

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalIdentifiers, setOriginalIdentifiers] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Fetch data for edit mode
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      setIsEditMode(true);
      // Fetch all entries first to find the specific entry by ID
      apiRequest("GET", "/api/data-entries")
        .then(res => res.json())
        .then(entries => {
          if (Array.isArray(entries)) {
            // Cari entry dengan id number atau string (untuk robust)
            let entry = entries.find(e => e.id === parseInt(editId));
            if (!entry) {
              entry = entries.find(e => e.id?.toString() === editId);
            }
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
              setOriginalIdentifiers({
                date: entry.date,
                patientName: entry.patientName,
                medicalRecordNumber: entry.medicalRecordNumber,
              });
            } else {
              toast({ title: "Error", description: `Data dengan ID ${editId} tidak ditemukan di database. Pastikan data sudah tersinkronisasi.`, variant: "destructive" });
              navigate("/data-harian");
            }
          } else {
            toast({ title: "Error", description: "Format data tidak valid dari API", variant: "destructive" });
            navigate("/data-harian");
          }
        })
        .catch(() => {
          toast({ title: "Error", description: "Gagal mengambil data untuk edit", variant: "destructive" });
          navigate("/data-harian");
        });
    }
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'), // Set tanggal hari ini
      patientName: "",
      medicalRecordNumber: "",
      gender: undefined,
      paymentType: undefined,
      actions: [],
      otherActions: "",
      description: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      setIsSubmitting(true);
      const promises = [];

      // Log data yang dikirim ke backend
      console.log("[DEBUG] Payload POST ke backend:", data);

      // Promise untuk Web3 submission (jika terhubung)
      if (web3Provider.isConnected) {
        promises.push(
          web3Provider.addEntry(data.date, data.actions || [], data.description || "")
            .then(() => {
              console.log("Data berhasil disimpan ke blockchain");
            })
            .catch((error) => {
              console.log("Web3 submission failed, falling back to API", error);
            })
        );
      }

      // Google Sheets payload
      const mappedFormObject: { [key: string]: string | undefined } = {
        "Tanggal Kunjungan": data.date,
        "Nama Pasien": data.patientName,
        "No.RM": data.medicalRecordNumber,
        "Kelamin": data.gender,
        "Biaya": data.paymentType,
        "Lainnya": data.otherActions || ""
      };
      actionOptions.forEach(option => {
        if (data.actions && data.actions.includes(option.id)) {
          mappedFormObject[option.label] = "Yes";
        } else {
          mappedFormObject[option.label] = "No";
        }
      });
      // Jika edit mode, tambahkan action dan identifier asli
      if (isEditMode && originalIdentifiers) {
        mappedFormObject["action"] = "edit";
        mappedFormObject["Tanggal Kunjungan_asli"] = originalIdentifiers.date;
        mappedFormObject["Nama Pasien_asli"] = originalIdentifiers.patientName;
        mappedFormObject["No.RM_asli"] = originalIdentifiers.medicalRecordNumber;
      }

      promises.push(
        fetch(
          "https://script.google.com/macros/s/AKfycbxnyacmLOW4Ts93_S56wLJj1i4eT76sm1SvJhXu8w-MAmyAtj9DPtoaY28mvD9OkmD2/exec",
          {
            method: "POST",
            body: new URLSearchParams(Object.fromEntries(Object.entries(mappedFormObject).map(([key, value]) => [key, value ?? '']))),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        )
        .then(response => response.json())
        .then(sheetsData => {
          if (sheetsData.result !== "success") {
            console.error("Gagal mengirim data ke Google Sheets:", sheetsData.message);
            toast({
              title: "Error",
              description: isEditMode ? "Gagal update data di Google Sheets" : "Gagal mengirim data ke Google Sheets",
              variant: "destructive"
            });
          } else {
            console.log(isEditMode ? "Data berhasil diupdate di Google Sheets" : "Data berhasil disimpan ke Google Sheets");
          }
        })
        .catch(sheetError => {
          console.error("Error saat mengirim ke Google Sheets:", sheetError);
          toast({
            title: "Error",
            description: isEditMode ? "Gagal update data di Google Sheets" : "Gagal terhubung ke Google Sheets",
            variant: "destructive"
          });
        })
      );
      // API request
      if (isEditMode && originalIdentifiers) {
        promises.push(
          apiRequest("PUT", `/api/data-entries/${searchParams.get("edit")}` , data).then(res => res.json())
        );
      } else {
        promises.push(
          apiRequest("POST", "/api/data-entries", data).then(res => res.json())
        );
      }
      await Promise.allSettled(promises);
      return promises[promises.length - 1];
    },
    onSuccess: (result) => {
      // Log data yang diterima dari backend (termasuk id)
      console.log("[DEBUG] Response dari backend:", result);
      clearForm();
      setIsEditMode(false);
      setOriginalIdentifiers(null);
      toast({
        title: "Sukses",
        description: isEditMode ? "Data berhasil diupdate" : "Data berhasil disimpan",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-visits"] });
      queryClient.refetchQueries({ queryKey: ["/api/statistics"] });
      queryClient.refetchQueries({ queryKey: ["/api/daily-visits"] });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menyimpan data. Silakan coba lagi.",
        variant: "destructive",
      });
      console.error("Submission error:", error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Submitting form data for edit/add:", JSON.stringify(data, null, 2)); // DIAGNOSTIC LOG
    // Validate that either actions or otherActions is filled
    if ((!data.actions || data.actions.length === 0) && (!data.otherActions || data.otherActions.trim() === "")) {
      toast({
        title: "Error",
        description: "Wajib mengisi minimal satu Tindakan atau Tindakan Lainnya",
        variant: "destructive",
      });
      return;
    }
    
    // Tidak perlu menambahkan ID manual, biarkan database yang mengelola ID
    submitMutation.mutate(data);
  };

  const clearForm = () => {
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
    setIsEditMode(false);
    setOriginalIdentifiers(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-all duration-500">
            <CardContent className="p-5 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Input Data Harian
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Catat tindakan medis dan rujukan hari ini
                  </p>
                </div>
                <motion.div 
                  className="text-blue-600 text-3xl self-start sm:self-auto"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <CalendarPlus className="h-8 w-8" />
                </motion.div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Date Field */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tanggal <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="focus:ring-2 focus:ring-blue-500 transition-all duration-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Patient Information Section */}
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Patient Name */}
                    <FormField
                      control={form.control}
                      name="patientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nama Pasien <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Masukkan nama lengkap pasien" 
                              {...field} 
                              className="focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Medical Record Number */}
                    <FormField
                      control={form.control}
                      name="medicalRecordNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            No. RM <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Contoh : 00.00.00" 
                              {...field} 
                              className="focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Gender */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Kelamin <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="focus:ring-2 focus:ring-blue-500 transition-all duration-300">
                                <SelectValue placeholder="Pilih jenis kelamin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                              <SelectItem value="Perempuan">Perempuan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Payment Type */}
                    <FormField
                      control={form.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Biaya <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="focus:ring-2 focus:ring-blue-500 transition-all duration-300">
                                <SelectValue placeholder="Pilih jenis pembayaran" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BPJS">BPJS</SelectItem>
                              <SelectItem value="UMUM">UMUM</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Actions Checkboxes */}
                  <FormField
                    control={form.control}
                    name="actions"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Tindakan <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                          {actionOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="actions"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-0 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      id={option.id}
                                      checked={field.value?.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), option.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== option.id
                                              )
                                            );
                                      }}
                                      className="sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel
                                    htmlFor={option.id}
                                    className={
                                      [
                                        "flex-1 px-3 py-2 text-center border rounded-md cursor-pointer transition-all duration-300 text-sm font-medium",
                                        field.value?.includes(option.id)
                                          ? "bg-blue-600 text-white border-blue-600 transform scale-105"
                                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300"
                                      ].join(" ")
                                    }
                                  >
                                    {option.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Other Actions */}
                  <FormField
                    control={form.control}
                    name="otherActions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tindakan Lainnya <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Sebutkan tindakan lainnya..."
                            {...field}
                            className="focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          * Pilih minimal satu tindakan di atas atau isi tindakan lainnya
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  {/* Action Buttons */}
                  <motion.div 
                    className="flex justify-center pt-4 sm:pt-6 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg transition-all duration-300 hover:shadow-lg flex items-center"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? (isEditMode ? "Menyimpan Perubahan..." : "Menyimpan...") : (isEditMode ? "Update Data" : "Submit Data")}
                      </Button>
                    </motion.div>
                    {isEditMode && (
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearForm}
                          className="px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg transition-all duration-300 hover:shadow-lg flex items-center"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Batal Edit
                        </Button>
                      </motion.div>
                    )}
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