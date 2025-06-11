import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ClipboardList, TrendingUp, CheckSquare, Plus, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: ClipboardList,
      title: "Data Harian",
      description: "Catat semua tindakan medis dan rujukan pasien dengan mudah dan terstruktur.",
    },
    {
      icon: TrendingUp,
      title: "Dashboard Analytics",
      description: "Monitor statistik praktek dengan visualisasi data yang interaktif dan real-time.",
    },
    {
      icon: CheckSquare,
      title: "Manajemen Tugas",
      description: "Kelola tugas dan arship dengan sistem galeri yang terorganisir dengan baik.",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
            <img 
              src="/assets/Praktek.png" 
              alt="Praktek Mandiri drg. Danny Hanggono" 
              className="w-full h-auto max-h-[400px] sm:max-h-[450px] md:max-h-[500px] object-cover object-center transform hover:scale-102 transition-transform duration-500"
            />
          </div>
          
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Selamat Datang di<br/>
              <span className="text-blue-600">Pratek Mandiri</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Sistem Manajemen Digital untuk Praktek Dokter Gigi<br/>
              drg. Danny Hanggono
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/data-harian">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Input Data Harian
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Lihat Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.3 + index * 0.1,
                ease: "easeOut" 
              }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" } 
              }}
              className="h-full"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-500 border-opacity-70 hover:border-blue-200">
                <CardContent className="p-6">
                  <motion.div 
                    className="text-blue-600 text-3xl mb-4"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <feature.icon className="h-8 w-8" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
