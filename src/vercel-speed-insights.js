// Integrasi Vercel Speed Insights untuk React/Vite
(function(){
  var s=document.createElement('script');
  s.src="https://speed.vercel.dev/script.js";
  s.defer=true;
  s.setAttribute("data-sdkn","@vercel/speed-insights");
  document.head.appendChild(s);
})();
