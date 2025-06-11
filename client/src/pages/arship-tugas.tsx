import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface TaskCard {
  id: number;
  title: string;
  description: string;
  image: string;
  url: string;
  taskNumber: string;
}

const tasks: TaskCard[] = [
  {
    id: 1,
    title: "Survey Kessan BPJS",
    description: "Survey kepuasan pelayanan kesehatan BPJS Kesehatan",
    image: "/assets/Kessan.jpg",
    url: "https://kesan.bpjs-kesehatan.go.id/kessan/survey/search/ew0KImtkcHBrIjogIjAxNTdHMDA3IiwNCiJubXBwayI6ICIgZHJnLiBEYW5ueSBIYW5nZ29ubyIsDQoia2RkYXRpMiI6ICIwMTU3Ig0KfQ",
    taskNumber: "Survey 1"
  },
  {
    id: 2,
    title: "Survey Kepuasan Pasien",
    description: "Survey kepuasan pasien Kementerian Kesehatan",
    image: "/assets/Kepuasan.png",
    url: "https://mutufasyankes.kemkes.go.id/halaman/survei_kepuasan_pasien/0902612912",
    taskNumber: "Survey 2"
  }
];

export default function ArshipTugas() {
  const handleTaskClick = (task: TaskCard) => {
    window.open(task.url, '_blank');
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Survey Kepuasan Pelayanan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Akses survey kepuasan pelayanan untuk meningkatkan kualitas praktek
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto"
        >
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => handleTaskClick(task)}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 group border-gray-200 hover:border-blue-200">
                <div className="relative overflow-hidden">
                  <img
                    src={task.image}
                    alt={task.title}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                </div>
                <CardContent className="p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {task.taskNumber}
                    </span>
                    <motion.div
                      whileHover={{ rotate: 15, scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}