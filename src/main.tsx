import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { appWindow } from "@tauri-apps/api/window";

await appWindow.setSkipTaskbar(true);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// npx tailwindcss -i ./src/styles.css -o ./src/App.css --watch