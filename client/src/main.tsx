// Main entry point for Praktek Mandiri Frontend
// Author: drg. Danny Hanggono
// Last updated: 2025-06-13
// Professional React app bootstrap

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

createRoot(container).render(<App />);
