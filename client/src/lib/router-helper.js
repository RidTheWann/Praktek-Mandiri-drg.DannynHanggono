// router-helper.js
// Fungsi untuk navigasi SPA yang mencegah refresh halaman

/**
 * Fungsi untuk navigasi tanpa refresh halaman
 * @param {string} path - Path tujuan navigasi
 */
export function navigateTo(path) {
  // Gunakan history API untuk navigasi tanpa refresh
  window.history.pushState({}, "", path);
  // Trigger popstate event untuk memberitahu router
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Fungsi untuk menangani refresh halaman
 * Dipanggil saat aplikasi dimuat
 */
export function setupRefreshHandler() {
  if (typeof window !== 'undefined') {
    // Simpan path asli sebelum refresh
    const originalPath = window.location.pathname + window.location.search;
    
    // Tambahkan event listener untuk menangani refresh
    window.addEventListener('load', () => {
      // Jika path bukan root, dan kita berada di SPA route
      if (originalPath !== '/' && 
          ['/dashboard', '/data-harian', '/arship-tugas', '/search-patient'].some(
            route => originalPath.startsWith(route)
          )) {
        // Pastikan kita berada di path yang benar setelah refresh
        window.history.replaceState({}, '', originalPath);
      }
    });
  }
}

// Panggil setup handler
setupRefreshHandler();