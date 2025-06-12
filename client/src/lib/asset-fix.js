/**
 * Asset Fix untuk menangani masalah loading asset
 */

// Jalankan saat aplikasi dimuat
if (typeof window !== 'undefined') {
  // Tangani error loading asset
  window.addEventListener('error', function(event) {
    const target = event.target;
    
    // Cek apakah error terjadi pada loading script atau stylesheet
    if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      const src = target.src || target.href;
      
      // Jika path dimulai dengan / tapi bukan /assets, coba load dari /assets
      if (src && src.startsWith('/') && !src.startsWith('/assets/')) {
        const newSrc = src.replace(/^\//, '/assets/');
        console.log(`Mencoba load ulang asset dari ${newSrc}`);
        
        if (target.tagName === 'SCRIPT') {
          const newScript = document.createElement('script');
          newScript.src = newSrc;
          newScript.type = 'text/javascript';
          document.head.appendChild(newScript);
        } else if (target.tagName === 'LINK' && target.rel === 'stylesheet') {
          const newLink = document.createElement('link');
          newLink.href = newSrc;
          newLink.rel = 'stylesheet';
          document.head.appendChild(newLink);
        }
      }
    }
  }, true);
}

export default function setupAssetFix() {
  // Fungsi ini dipanggil di App.jsx untuk memastikan script dijalankan
  console.log('Asset fix loaded');
}