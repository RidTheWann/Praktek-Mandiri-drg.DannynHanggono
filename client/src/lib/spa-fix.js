/**
 * SPA Fix untuk Vercel dan hosting lainnya
 * Menangani masalah 404 saat refresh halaman
 */

// Jalankan saat aplikasi dimuat
if (typeof window !== 'undefined') {
  // Tambahkan event listener untuk menangani refresh halaman
  window.addEventListener('load', () => {
    // Jika ada error 404, redirect ke root dengan hash
    if (document.title.includes('404') || document.body.textContent.includes('404')) {
      const path = window.location.pathname;
      window.location.href = '/#' + path;
    }
  });

  // Tangani navigasi dengan hash jika ada
  if (window.location.hash && window.location.hash.length > 1) {
    const path = window.location.hash.substring(1);
    window.history.replaceState(null, '', path);
  }
  
  // Handle service worker if available
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
}

export default function setupSPAFix() {
  // Fungsi ini dipanggil di App.jsx untuk memastikan script dijalankan
  console.log('SPA Fix loaded');
}