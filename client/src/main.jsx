import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
var container = document.getElementById("root");
if (!container) {
    throw new Error("Root element not found");
}
createRoot(container).render(<App />);
