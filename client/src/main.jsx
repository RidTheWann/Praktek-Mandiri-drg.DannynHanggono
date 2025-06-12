import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/spa-fix"; // Import SPA fix for client-side routing

// Polyfill untuk older browsers
if (!window.structuredClone) {
  window.structuredClone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Error handler global
window.addEventListener('error', function(event) {
  console.log('Global error caught:', event.error);
  // Prevent default untuk mencegah crash
  event.preventDefault();
});

var container = document.getElementById("root");
if (!container) {
    throw new Error("Root element not found");
}
createRoot(container).render(<App />);