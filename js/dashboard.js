document.addEventListener('DOMContentLoaded', () => {
  // Elemen DOM
  const sidebarLinks = document.querySelectorAll('.sidebar a');
  const chartSections = document.querySelectorAll('.chart-section');
  const tableSection = document.getElementById('kunjungan-harian'); // Section Tabel Kunjungan
  const tabelKunjunganBody = document.querySelector('#tabelKunjungan tbody');
  const backToHomeBtn = document.getElementById('backToHome');
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const filterTanggalInput = document.getElementById('filter-tanggal');

  // Toggle sidebar (mobile)
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Fungsi untuk menampilkan section tertentu
  function showSection(sectionId) {
    chartSections.forEach(section => section.classList.remove('active'));
    tableSection.classList.remove('active');
    if (sectionId === 'kunjungan-harian') {
      tableSection.classList.add('active');
    } else {
      const sectionToShow = document.getElementById(sectionId);
      if (sectionToShow) sectionToShow.classList.add('active');
    }
    if (window.innerWidth <= 768) sidebar.classList.remove('open');
  }

  // Event listener pada link sidebar
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      showSection(sectionId);
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      if (sectionId.startsWith('total-')) updateCharts(sectionId);
    });
  });

  if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'Home.html';
    });
  }

  let chartPasienHarianInstance = null;
  let chartPasienBulananInstance = null;
  let chartBiayaInstance = null;
  let chartTindakanInstance = null;

  // Cache in-memory: localStorage dengan durasi 10 detik
  async function fetchData(tanggal = null) {
    const cacheKey = tanggal ? `data_${tanggal}` : "data_all";
    const cacheExpiry = 10000; // 10 detik
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (new Date().getTime() - parsed.timestamp < cacheExpiry) {
        return parsed.data;
      }
    }
    try {
      let url = '/api/get-data';
      if (tanggal) url += `?tanggal=${tanggal}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: new Date().getTime(),
        data: result.data
      }));
      return result.data;
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      return [];
    }
  }

  // Pre-fetch adjacent dates saat user memilih tanggal baru
  function prefetchAdjacentDates(selectedDate) {
    const dateObj = new Date(selectedDate);
    if (isNaN(dateObj)) return;
    const formatDate = d => d.toISOString().split('T')[0];
    const prevDate = new Date(dateObj);
    prevDate.setDate(dateObj.getDate() - 1);
    const nextDate = new Date(dateObj);
    nextDate.setDate(dateObj.getDate() + 1);
    // Pre-fetch (tidak menunggu hasil)
    fetchData(formatDate(prevDate));
    fetchData(formatDate(nextDate));
  }

  // Update chart sesuai section
  async function updateCharts(sectionId) {
    try {
      const data = await fetchData();
      if (sectionId === 'total-pasien-harian') {
        const { labelsHarian, dataLakiHarian, dataPerempuanHarian } = processDataHarian(data);
        if (chartPasienHarianInstance) chartPasienHarianInstance.destroy();
        chartPasienHarianInstance = createChart('chartPasienHarian', 'bar', labelsHarian, dataLakiHarian, dataPerempuanHarian);
      } else if (sectionId === 'total-pasien-bulanan') {
        const { labelsBulanan, dataLakiBulanan, dataPerempuanBulanan } = processDataBulanan(data);
        if (chartPasienBulananInstance) chartPasienBulananInstance.destroy();
        chartPasienBulananInstance = createChart('chartPasienBulanan', 'bar', labelsBulanan, dataLakiBulanan, dataPerempuanBulanan);
      } else if (sectionId === 'total-biaya') {
        const { labelsBiaya, dataBPJS, dataUmum } = processDataBiaya(data);
        if (chartBiayaInstance) chartBiayaInstance.destroy();
        chartBiayaInstance = createChartBiaya('chartBiaya', labelsBiaya, dataBPJS, dataUmum);
      } else if (sectionId === 'total-tindakan') {
        const { labelsTindakan, dataTindakan } = processDataTindakan(data);
        if (chartTindakanInstance) chartTindakanInstance.destroy();
        // Buat chart Tindakan dengan penjelasan warna
        chartTindakanInstance = createChartTindakan('chartTindakan', labelsTindakan, dataTindakan);
      }
    } catch (error) {
      console.error("Gagal update chart:", error);
    }
  }

  // ======== PEMROSESAN DATA ===========
  function processDataHarian(data) {
    const dailyCounts = {};
    data.forEach(item => {
      const tgl = (item["Tanggal Kunjungan"] || "").trim();
      if (!tgl || tgl === "-") return;
      const kelamin = (item["Kelamin"] || "").trim();
      if (!dailyCounts[tgl]) dailyCounts[tgl] = { lakiLaki: 0, perempuan: 0 };
      if (kelamin === "Laki - Laki" || kelamin === "Laki-Laki") {
        dailyCounts[tgl].lakiLaki++;
      } else if (kelamin === "Perempuan") {
        dailyCounts[tgl].perempuan++;
      }
    });
    const labelsHarian = Object.keys(dailyCounts);
    const dataLakiHarian = labelsHarian.map(t => dailyCounts[t].lakiLaki);
    const dataPerempuanHarian = labelsHarian.map(t => dailyCounts[t].perempuan);
    return { labelsHarian, dataLakiHarian, dataPerempuanHarian };
  }

  function processDataBulanan(data) {
    const monthlyCounts = {};
    data.forEach(item => {
      const tgl = (item["Tanggal Kunjungan"] || "").trim();
      if (!tgl || tgl === "-") return;
      const parts = tgl.split('-');
      if (parts.length < 2) return;
      const [year, month] = parts;
      const monthYear = `${year}-${month}`;
      const kelamin = (item["Kelamin"] || "").trim();
      if (!monthlyCounts[monthYear]) {
        monthlyCounts[monthYear] = { "Laki - Laki": 0, "Perempuan": 0 };
      }
      if (kelamin === "Laki - Laki" || kelamin === "Laki-Laki") {
        monthlyCounts[monthYear]["Laki - Laki"]++;
      } else if (kelamin === "Perempuan") {
        monthlyCounts[monthYear]["Perempuan"]++;
      }
    });
    const labelsBulanan = Object.keys(monthlyCounts);
    const dataLakiBulanan = labelsBulanan.map(m => monthlyCounts[m]["Laki - Laki"]);
    const dataPerempuanBulanan = labelsBulanan.map(m => monthlyCounts[m]["Perempuan"]);
    return { labelsBulanan, dataLakiBulanan, dataPerempuanBulanan };
  }

  function processDataBiaya(data) {
    const biayaCounts = {};
    data.forEach(item => {
      const tgl = (item["Tanggal Kunjungan"] || "").trim();
      if (!tgl || tgl === "-") return;
      const parts = tgl.split('-');
      if (parts.length < 2) return;
      const [year, month] = parts;
      const monthYear = `${year}-${month}`;
      const biaya = (item["Biaya"] || "").trim();
      if (!biayaCounts[monthYear]) {
        biayaCounts[monthYear] = { BPJS: 0, UMUM: 0 };
      }
      if (biaya === "BPJS") {
        biayaCounts[monthYear].BPJS++;
      } else if (biaya === "UMUM") {
        biayaCounts[monthYear].UMUM++;
      }
    });
    const labelsBiaya = Object.keys(biayaCounts);
    const dataBPJS = labelsBiaya.map(m => biayaCounts[m].BPJS || 0);
    const dataUmum = labelsBiaya.map(m => biayaCounts[m].UMUM || 0);
    return { labelsBiaya, dataBPJS, dataUmum };
  }

  function processDataTindakan(data) {
    const tindakanCounts = {};
    data.forEach(item => {
      const tgl = (item["Tanggal Kunjungan"] || "").trim();
      if (!tgl || tgl === "-") return;
      const parts = tgl.split('-');
      if (parts.length < 2) return;
      const [year, month] = parts;
      const monthYear = `${year}-${month}`;
      if (!tindakanCounts[monthYear]) tindakanCounts[monthYear] = {};

      const rawTindakan = (item["Tindakan"] || "").trim();
      if (rawTindakan) {
        const tindakanArray = rawTindakan.split(",").map(t => t.trim()).filter(Boolean);
        tindakanArray.forEach(tindakan => {
          tindakanCounts[monthYear][tindakan] = (tindakanCounts[monthYear][tindakan] || 0) + 1;
        });
      }
      const rawLainnya = (item["Lainnya"] || "").trim();
      if (rawLainnya && rawLainnya !== "-") {
        tindakanCounts[monthYear]["Lainnya"] = (tindakanCounts[monthYear]["Lainnya"] || 0) + 1;
      }
    });
    const labelsTindakan = [...new Set(Object.values(tindakanCounts).flatMap(Object.keys))];
    const dataTindakan = labelsTindakan.map(tindakan => {
      return Object.keys(tindakanCounts).reduce((total, m) => total + (tindakanCounts[m][tindakan] || 0), 0);
    });
    return { labelsTindakan, dataTindakan };
  }

  // ======= Chart Generators =======
  function createChart(canvasId, type, labels, dataLaki, dataPerempuan) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
      type,
      data: {
        labels,
        datasets: [
          {
            label: 'Laki-laki',
            data: dataLaki,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Perempuan',
            data: dataPerempuan,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  function createChartBiaya(canvasId, labels, dataBPJS, dataUmum) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'BPJS',
            data: dataBPJS,
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Umum',
            data: dataUmum,
            backgroundColor: 'rgba(255, 206, 86, 0.7)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  /**
   * createChartTindakan: Mengganti label "Jumlah Tindakan" dengan penjelasan warna
   * Anda bisa menyesuaikan teks label dengan memanfaatkan plugin legend bawaan Chart.js.
   */
  function createChartTindakan(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
  
    // Urutan label yang diinginkan
    const desiredOrder = [
      'Obat',
      'Cabut Anak',
      'Cabut Dewasa',
      'Tambal Sementara',
      'Tambal Tetap',
      'Scaling',
      'Rujuk',
      'Lainnya'
    ];
  
    // Hanya ambil label yang ada di 'labels' lalu urutkan
    const orderedLabels = desiredOrder.filter(label => labels.includes(label));
  
    // Mapping label -> data
    const mapping = {};
    labels.forEach((label, i) => {
      mapping[label] = data[i];
    });
    // Susun data sesuai urutan label
    const orderedData = orderedLabels.map(label => mapping[label] || 0);
  
    // Peta warna
    const colorMap = {
      'Obat': 'rgba(255, 99, 132, 0.7)',
      'Cabut Anak': 'rgba(54, 162, 235, 0.7)',
      'Cabut Dewasa': 'rgba(255, 206, 86, 0.7)',
      'Tambal Sementara': 'rgba(75, 192, 192, 0.7)',
      'Tambal Tetap': 'rgba(153, 102, 255, 0.7)',
      'Scaling': 'rgba(255, 159, 64, 0.7)',
      'Rujuk': 'rgba(255, 0, 0, 0.7)',
      'Lainnya': 'rgba(201, 203, 207, 0.7)'
    };
  
    // Warna teks yang diinginkan untuk judul chart & legend
    const textColor = '#fff'; // Ganti sesuai kebutuhan, misalnya "#fff" untuk putih
  
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: orderedLabels,
        datasets: [{
          label: 'Detail Tindakan', // Label dataset
          data: orderedData,
          backgroundColor: orderedLabels.map(label => colorMap[label] || 'rgba(201,203,207,0.7)'),
          borderColor: orderedLabels.map(label =>
            colorMap[label] ? colorMap[label].replace('0.7','1') : 'rgba(201,203,207,1)'
          ),
          borderWidth: 1
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: textColor  // Warna teks pada sumbu Y
            }
          },
          x: {
            ticks: {
              color: textColor  // Warna teks pada sumbu X
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: textColor, // Warna teks legend item
              generateLabels: function(chart) {
                // Legend item berdasarkan urutan label yang diinginkan
                return orderedLabels.map((label, i) => ({
                  text: label,
                  fillStyle: colorMap[label] || 'rgba(201,203,207,0.7)',
                  strokeStyle: colorMap[label] ? colorMap[label].replace('0.7','1') : 'rgba(201,203,207,1)',
                  hidden: false,
                  index: i
                }));
              }
            }
          },
          title: {
            display: true,
            text: 'Detail Tindakan',
            font: { size: 16 },
            color: textColor  // Warna teks judul chart
          }
        }
      }
    });
  }
  

  // ======= Populate Tabel Kunjungan Harian =======
  function populateTable(data) {
    tabelKunjunganBody.innerHTML = '';
    let counter = 1;
    data.forEach(item => {
      const deleteId = item._id || item.sheetInfo;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${counter++}</td>
        <td>${item["Tanggal Kunjungan"] || ""}</td>
        <td>${item["Nama Pasien"] || ""}</td>
        <td>${item["No.RM"] || "-"}</td>
        <td>${item["Tindakan"] || ""}</td>
        <td>${item["Biaya"] || ""}</td>
        <td>${item["Lainnya"] || ""}</td>
        <td>
          <button class="delete-button" data-id="${deleteId}">Hapus</button>
        </td>
      `;
      tabelKunjunganBody.appendChild(row);
    });
    addDeleteButtonListeners();
  }

  function addDeleteButtonListeners() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
      button.addEventListener('click', handleDelete);
    });
  }

  // ======= Handle Delete dengan Optimistic Update & Rollback UI =======
  async function handleDelete(event) {
    const idToDelete = event.target.dataset.id;
    const rowElement = event.target.closest('tr');

    const modal = document.getElementById('deleteConfirmationModal');
    const confirmButton = document.getElementById('confirmDelete');
    const cancelButton = document.getElementById('cancelDelete');
    const modalMessage = document.getElementById('modal-message');

    // Tampilkan modal konfirmasi
    modal.style.display = 'flex';
    modalMessage.textContent = "Apakah Anda yakin ingin menghapus data ini?";
    confirmButton.style.display = 'inline-block';
    cancelButton.style.display = 'inline-block';
    confirmButton.disabled = false;
    cancelButton.textContent = 'Batal';

    // Handler untuk tombol konfirmasi hapus
    confirmButton.onclick = async () => {
      // Sembunyikan tombol selama proses berlangsung
      confirmButton.style.display = 'none';
      cancelButton.style.display = 'none';
      // Tampilkan teks dengan spinner di bawahnya
      modalMessage.innerHTML = "Menghapus data<br><div class='spinner'></div>";

      // Optimistically hapus baris dari tampilan
      rowElement.remove();

      try {
        const response = await fetch(`/api/delete-data?index=${idToDelete}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.status !== "success") {
          throw new Error(result.message || "Gagal menghapus data di server");
        }
        modalMessage.textContent = 'Data berhasil dihapus.';
      } catch (error) {
        // Tidak melakukan rollback, hanya tampilkan pesan error
        modalMessage.textContent = `Gagal menghapus data: ${error.message}`;
      } finally {
        // Tampilkan tombol OK untuk menutup modal
        cancelButton.style.display = 'inline-block';
        cancelButton.textContent = 'OK';
        cancelButton.onclick = () => {
          modal.style.display = 'none';
          modalMessage.textContent = "Apakah Anda yakin ingin menghapus data ini?";
        };
      }
    };

    // Jika tombol batal ditekan sebelum konfirmasi
    cancelButton.onclick = () => {
      modal.style.display = 'none';
    };
  }

  // ======= Polling: Update Data setiap 10 detik =======
  function startPolling() {
    setInterval(async () => {
      const data = await fetchData(filterTanggalInput.value || null);
      populateTable(data);
      const activeSection = document.querySelector('.chart-section.active') || document.querySelector('.table-section.active');
      if (activeSection && activeSection.id.startsWith('total-')) {
        updateCharts(activeSection.id);
      }
      console.log("Polling: Dashboard diperbarui (10 detik).");
    }, 10000);
  }

  // ======= Inisialisasi: Tampilkan langsung section "kunjungan-harian" =======
  async function initialLoad() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${yyyy}-${mm}-${dd}`;
    if (filterTanggalInput) {
      filterTanggalInput.value = todayFormatted;
    }
    const data = await fetchData(todayFormatted);
    if (data.length > 0) {
      populateTable(data);
      // Pastikan link "kunjungan-harian" aktif
      const kunjunganLink = [...sidebarLinks].find(link => link.dataset.section === 'kunjungan-harian');
      if (kunjunganLink) {
        sidebarLinks.forEach(l => l.classList.remove('active'));
        kunjunganLink.classList.add('active');
      }
      showSection('kunjungan-harian');
      prefetchAdjacentDates(todayFormatted);
    } else {
      console.log('Tidak ada data yang tersedia.');
      tabelKunjunganBody.innerHTML = '<tr><td colspan="8">Tidak ada data kunjungan.</td></tr>';
    }
    startPolling();
  }

  // Pre-fetch data untuk tanggal sebelumnya dan sesudahnya
  if (filterTanggalInput) {
  filterTanggalInput.addEventListener('change', async () => {
    const selectedDate = filterTanggalInput.value;
    const filteredData = await fetchData(selectedDate);
    populateTable(filteredData);
    prefetchAdjacentDates(selectedDate);
    const activeSection = document.querySelector('.chart-section.active') || document.querySelector('.table-section.active');
    if (activeSection && activeSection.id === 'total-pasien-harian') {
      updateCharts(activeSection.id);
    }
  });
}

initialLoad();
});
