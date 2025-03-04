document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    const chartSections = document.querySelectorAll('.chart-section');
    const tableSection = document.getElementById('kunjungan-harian');
    const tabelKunjunganBody = document.querySelector('#tabelKunjungan tbody');
    const backToHomeBtn = document.getElementById('backToHome');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const filterTanggalInput = document.getElementById('filter-tanggal'); // Dapatkan elemen input tanggal


    // --- Toggle Sidebar (for mobile) ---
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }


    // --- Fungsi untuk menampilkan/menyembunyikan section ---
    function showSection(sectionId) {
        chartSections.forEach(section => {
            section.classList.remove('active');
        });
        tableSection.classList.remove('active');

        if (sectionId === 'kunjungan-harian') {
            tableSection.classList.add('active');
        } else {
            const sectionToShow = document.getElementById(sectionId);
            if (sectionToShow) {
                sectionToShow.classList.add('active');
            }
        }
        // Sembunyikan sidebar setelah memilih menu di mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    }

    // --- Event listener untuk link sidebar ---
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            showSection(sectionId);

            // Hapus class 'active' dari semua link, lalu tambahkan ke yang diklik
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');


            // Update chart
            if (sectionId.startsWith('total-')) {
                updateCharts(sectionId);
            }
        });
    });
    // --- Event listener untuk tombol kembali ke home ---
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'Home.html'; // Perbaiki path di sini
        });
    }

    // --- Fungsi untuk update chart  ---
    let chartPasienHarianInstance = null;
    let chartPasienBulananInstance = null;
    let chartBiayaInstance = null;
    let chartTindakanInstance = null;

    async function updateCharts(sectionId) {
        try {
            const data = await fetchData(); // Ambil data dari server

            if (sectionId === 'total-pasien-harian') {
                const {
                    labelsHarian,
                    dataLakiHarian,
                    dataPerempuanHarian
                } = processDataHarian(data);

                if (chartPasienHarianInstance) {
                    chartPasienHarianInstance.destroy(); // Hancurkan chart sebelumnya
                }
                chartPasienHarianInstance = createChart('chartPasienHarian', 'bar', labelsHarian, dataLakiHarian, dataPerempuanHarian);

            } else if (sectionId === 'total-pasien-bulanan') {
                const {
                    labelsBulanan,
                    dataLakiBulanan,
                    dataPerempuanBulanan
                } = processDataBulanan(data);
                if (chartPasienBulananInstance) {
                    chartPasienBulananInstance.destroy();
                }
                chartPasienBulananInstance = createChart('chartPasienBulanan', 'bar', labelsBulanan, dataLakiBulanan, dataPerempuanBulanan);

            } else if (sectionId === 'total-biaya') {
                const {
                    labelsBiaya,
                    dataBPJS,
                    dataUmum
                } = processDataBiaya(data);
                if (chartBiayaInstance) {
                    chartBiayaInstance.destroy();
                }
                chartBiayaInstance = createChartBiaya('chartBiaya', labelsBiaya, dataBPJS, dataUmum);


            } else if (sectionId === 'total-tindakan') {
                const {
                    labelsTindakan,
                    dataTindakan
                } = processDataTindakan(data);

                if (chartTindakanInstance) {
                    chartTindakanInstance.destroy();
                }
                chartTindakanInstance = createChartTindakan('chartTindakan', labelsTindakan, dataTindakan);
            }

        } catch (error) {
            console.error("Gagal update chart:", error);
        }
    }
    //---------Fungsi untuk memproses Total pasien Harian
    function processDataHarian(data) {
        const dailyCounts = {};

        data.forEach(item => {
            const tanggal = item["Tanggal Kunjungan"];
            const kelamin = item["Kelamin"];

            if (!dailyCounts[tanggal]) {
                dailyCounts[tanggal] = {
                    lakiLaki: 0,
                    perempuan: 0
                };
            }

            if (kelamin === "Laki-Laki") {
                dailyCounts[tanggal].lakiLaki++;
            } else if (kelamin === "Perempuan") {
                dailyCounts[tanggal].perempuan++;
            }
        });

        const labelsHarian = Object.keys(dailyCounts);
        const dataLakiHarian = labelsHarian.map(tanggal => dailyCounts[tanggal].lakiLaki);
        const dataPerempuanHarian = labelsHarian.map(tanggal => dailyCounts[tanggal].perempuan);

        return {
            labelsHarian,
            dataLakiHarian,
            dataPerempuanHarian
        };
    }
    //---------Fungsi untuk memproses Total pasien Bulanan
    function processDataBulanan(data) {
        const monthlyCounts = {};

        data.forEach(item => {
            const tanggal = item["Tanggal Kunjungan"];
            const [year, month] = tanggal.split('-'); // Pisahkan tahun dan bulan
            const monthYear = `<span class="math-inline">\{year\}\-</span>{month}`;
            const kelamin = item["Kelamin"];


            if (!monthlyCounts[monthYear]) {
                monthlyCounts[monthYear] = {
                    lakiLaki: 0,
                    perempuan: 0
                };
            }

            if (kelamin === "Laki-Laki") {
                monthlyCounts[monthYear].lakiLaki++;
            } else if (kelamin === "Perempuan") {
                monthlyCounts[monthYear].perempuan++;
            }
        });

        const labelsBulanan = Object.keys(monthlyCounts);
        const dataLakiBulanan = labelsBulanan.map(monthYear => monthlyCounts[monthYear].lakiLaki);
        const dataPerempuanBulanan = labelsBulanan.map(monthYear => monthlyCounts[monthYear].perempuan);

        return {
            labelsBulanan,
            dataLakiBulanan,
            dataPerempuanBulanan
        };

    }
    //----------Fungsi untuk memproses Data Biaya
    function processDataBiaya(data) {
        const biayaCounts = {};

        data.forEach(item => {
            const tanggal = item["Tanggal Kunjungan"];
            const [year, month] = tanggal.split('-'); // Pisahkan tahun dan bulan
            const monthYear = `<span class="math-inline">\{year\}\-</span>{month}`;
            const biaya = item["Biaya"];


            if (!biayaCounts[monthYear]) {
                biayaCounts[monthYear] = {
                    BPJS: 0,
                    Umum: 0
                };
            }

            if (biaya === "BPJS") {
                biayaCounts[monthYear].BPJS++;
            } else if (biaya === "UMUM") {
                biayaCounts[monthYear].Umum++;
            }
        });

        const labelsBiaya = Object.keys(biayaCounts);
        const dataBPJS = labelsBiaya.map(monthYear => biayaCounts[monthYear].BPJS);
        const dataUmum = labelsBiaya.map(monthYear => biayaCounts[monthYear].Umum);

        return {
            labelsBiaya,
            dataBPJS,
            dataUmum
        };

    }
    //---------Fungsi untuk memproses Data Tindakan

    function processDataTindakan(data) {
        const tindakanCounts = {};

        data.forEach(item => {
            const tanggal = item["Tanggal Kunjungan"];
            const [year, month] = tanggal.split('-');
            const monthYear = `<span class="math-inline">\{year\}\-</span>{month}`;

            // Pastikan 'Tindakan' ada dan bukan null/undefined
            if (item["Tindakan"]) {
                const tindakanArray = item["Tindakan"].split(",").map(t => t.trim()); // Pisahkan string tindakan

                tindakanArray.forEach(tindakan => {
                    if (!tindakanCounts[monthYear]) {
                        tindakanCounts[monthYear] = {};
                    }
                    tindakanCounts[monthYear][tindakan] = (tindakanCounts[monthYear][tindakan] || 0) + 1;
                });
            }
        });

        const labelsTindakan = [...new Set(Object.values(tindakanCounts).flatMap(Object.keys))]; // Ambil semua jenis tindakan unik
        const dataTindakan = labelsTindakan.map(tindakan => {
            return Object.keys(tindakanCounts).reduce((total, monthYear) => {
                return total + (tindakanCounts[monthYear][tindakan] || 0);
            }, 0);
        });

        return {
            labelsTindakan,
            dataTindakan
        };
    }
    //----- CHART UNTUK TOTAL PASIEN HARIAN DAN BULANAN
    function createChart(canvasId, type, labels, dataLaki, dataPerempuan) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
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
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    //----- CHART UNTUK BIAYA
    function createChartBiaya(canvasId, labels, dataBPJS, dataUmum) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'bar', // Menggunakan grafik batang
            data: {
                labels: labels, // Bulan dan tahun, misalnya "2024-07", "2024-08"
                datasets: [{
                        label: 'BPJS',
                        data: dataBPJS,
                        backgroundColor: 'rgba(75, 192, 192, 0.7)', // Warna untuk BPJS
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Umum',
                        data: dataUmum,
                        backgroundColor: 'rgba(255, 206, 86, 0.7)', // Warna untuk Umum
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    //-----CHART UNTUK TINDAKAN
    function createChartTindakan(canvasId, labels, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        // Buat objek yang memetakan label ke warna
        const colorMap = {
            'Obat': 'rgba(255, 99, 132, 0.7)', // Merah
            'Cabut Anak': 'rgba(54, 162, 235, 0.7)', // Biru
            'Cabut Dewasa': 'rgba(255, 206, 86, 0.7)', // Kuning
            'Tambal Sementara': 'rgba(75, 192, 192, 0.7)', // Hijau
            'Tambal Tetap': 'rgba(153, 102, 255, 0.7)', // Ungu
            'Scaling': 'rgba(255, 159, 64, 0.7)', // Oranye
            'Rujuk': 'rgba(255, 0, 0, 0.7)' // Merah Tua
        };

        const datasets = labels.map((label, index) => {
            return {
                label: label,
                data: data.map(item => item === label ? 1 : 0), // Data di sini perlu diubah
                backgroundColor: colorMap[label] || 'rgba(201, 203, 207, 0.7)', // Warna abu-abu jika tidak ada di colorMap
                borderColor: colorMap[label] ? colorMap[label].replace('0.7', '1') : 'rgba(201, 203, 207, 1)',
                borderWidth: 1,
            };
        });
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels, // Ini akan menjadi label tindakan (Obat, Cabut Anak, dll.)
                datasets: [{
                    label: 'Jumlah Tindakan',
                    data: data, // Ini akan menjadi jumlah kemunculan setiap tindakan
                    backgroundColor: labels.map(label => colorMap[label] || 'rgba(201, 203, 207, 0.7)'), // Gunakan warna dari colorMap
                    borderColor: labels.map(label => colorMap[label] ? colorMap[label].replace('0.7', '1') : 'rgba(201, 203, 207, 1)'),
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1 // Menampilkan hanya angka bulat pada sumbu Y
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true, // Menampilkan legenda
                        position: 'top', // Posisi legenda
                    }
                }
            }
        });
    }


    // --- Fungsi untuk mengisi tabel kunjungan harian ---
    function populateTable(data) {
        tabelKunjunganBody.innerHTML = ''; // Kosongkan tabel

        data.forEach((item) => { // <-- Hapus index, iterasi langsung pada item
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item["Tanggal Kunjungan"]}</td>
                <td>${item["Nama Pasien"]}</td>
                <td>${item["No.RM"]}</td>
                <td>${item["Tindakan"] || "-"}</td>
                <td>${item["Biaya"]}</td>
                <td>${item["Lainnya"] || "-"}</td>
                <td>
                    <button class="delete-button" data-id="${item._id}">Hapus</button> 
                </td>
            `;
            tabelKunjunganBody.appendChild(row);
        });

        // Tambahkan event listener untuk tombol hapus *setelah* tabel diisi
        addDeleteButtonListeners();
    }

    // --- Fungsi untuk menambahkan event listener ke tombol hapus ---
    function addDeleteButtonListeners() {
        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', handleDelete);
        });
    }

    // --- Fungsi handler untuk tombol hapus ---
    async function handleDelete(event) {
        const idToDelete = event.target.dataset.id;
        const modal = document.getElementById('deleteConfirmationModal');
        const confirmButton = document.getElementById('confirmDelete');
        const cancelButton = document.getElementById('cancelDelete');
        const modalMessage = document.getElementById('modal-message'); // Tambahkan ini

        // Tampilkan modal
        modal.style.display = 'flex'; // Ubah display menjadi flex

        // Event listener untuk tombol konfirmasi di dalam modal
        confirmButton.onclick = async () => {
            try {
                // Kirim request DELETE ke server, sertakan _id di URL
                const response = await fetch(`/api/delete-data?index=${idToDelete}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (result.status !== "success") {
                    throw new Error(result.message || "Gagal menghapus data di server");
                }

                // Update tampilan
                const newData = await fetchData();
                populateTable(newData);

                const activeSection = document.querySelector('.chart-section.active') || document.querySelector('.table-section.active');
                if (activeSection) {
                    updateCharts(activeSection.id);
                }

                // Tampilkan pesan sukses di modal yang sama
             modalMessage.textContent = 'Data berhasil dihapus.';
             confirmButton.style.display = 'none'; // Sembunyikan tombol "Ya"
             cancelButton.textContent = 'OK';     // Ubah teks tombol "Batal" menjadi "OK"
              cancelButton.onclick = () => {  //ganti fungsi tombol cancel
                  modal.style.display = 'none'; // Sembunyikan modal
                   // Kembalikan tombol dan pesan ke semula jika modal digunakan lagi
                   confirmButton.style.display = 'inline-block'; // Tampilkan kembali
                   cancelButton.textContent = 'Batal';
                   modalMessage.textContent = 'Apakah Anda yakin ingin menghapus data ini?';
             };

         } catch (error) {
             // ... (kode penanganan error) ...
             // Tampilkan pesan error di modal (opsional)
            modalMessage.textContent = `Gagal menghapus data: ${error.message}`;
            confirmButton.style.display = 'none'; // Sembunyikan tombol konfirmasi
            cancelButton.textContent = "OK"; // Ubah tombol "Batal" menjadi "OK"
            cancelButton.onclick = () => {
                modal.style.display = 'none';
                 confirmButton.style.display = 'inline-block';
                 cancelButton.textContent = 'Batal';
                 modalMessage.textContent = 'Apakah Anda yakin ingin menghapus data ini?';
            }


         } finally {
             // modal.style.display = 'none'; // Hapus ini dari finally
         }
     };

        // Event listener untuk tombol batal di dalam modal
        cancelButton.onclick = () => {
            modal.style.display = 'none'; // Sembunyikan modal
        };
    }

    // --- EVENT LISTENER UNTUK INPUT TANGGAL ---
    if (filterTanggalInput) {
        filterTanggalInput.addEventListener('change', async () => {
            const selectedDate = filterTanggalInput.value;
            const filteredData = await fetchData(selectedDate); // Fetch data dengan tanggal
            populateTable(filteredData); // Tampilkan data yang difilter
            //update chart ketika difilter
            const activeSection = document.querySelector('.chart-section.active') || document.querySelector('.table-section.active');
            if (activeSection && activeSection.id === 'total-pasien-harian') {
                updateCharts(activeSection.id);
            }

        });
    }


    // --- Fungsi untuk mengambil data dari server ---
    // MODIFIKASI fetchData: Tambahkan parameter tanggal
    async function fetchData(date = null) { // Default: null (ambil semua)
        try {
            let url = '/api/get-data';
            if (date) {
                url += `?tanggal=${date}`; // Tambahkan query parameter jika ada tanggal
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data;

        } catch (error) {
            console.error("Gagal mengambil data:", error);
            const errorDiv = document.createElement('div');
            errorDiv.textContent = "Gagal mengambil data dari server. Pastikan server berjalan dan coba muat ulang halaman.";
            errorDiv.style.color = 'red';
            document.body.appendChild(errorDiv);
            return [];
        }
    }

    // --- Initial Load ---
    async function initialLoad() {
        // Dapatkan tanggal hari ini dalam format YYYY-MM-DD
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // +1 karena bulan dimulai dari 0
        const dd = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${yyyy}-${mm}-${dd}`;

        // Set nilai input tanggal ke hari ini
        if (filterTanggalInput) {  // Periksa apakah elemennya ada
            filterTanggalInput.value = todayFormatted;
        }


        const data = await fetchData();
        if (data.length > 0) {
            populateTable(data);
            showSection('total-pasien-harian');  //Tampilkan total pasien harian diawal
            updateCharts('total-pasien-harian'); // Update chart saat pertama kali load
            sidebarLinks[0].classList.add('active');
        } else {
            console.log('Tidak ada data yang tersedia.');
            tabelKunjunganBody.innerHTML = '<tr><td colspan="7">Tidak ada data kunjungan.</td></tr>';
        }
    }

    initialLoad();
});