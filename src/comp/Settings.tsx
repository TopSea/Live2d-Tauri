import React from "react";
import ReactDOM from "react-dom/client";
import SettingsComp from "./SettingsComp";
import { WebviewWindow } from "@tauri-apps/api/window";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SettingsComp />
  </React.StrictMode>,
);

var settingOpened = false;
export function openSettings() {
  if (settingOpened) {
    const settingsWindow = WebviewWindow.getByLabel('tauri_win_settings');
    settingsWindow?.show();
    settingsWindow?.unminimize();
    settingsWindow?.setFocus();
  } else {
    const settingsWindow = new WebviewWindow('tauri_win_settings', {
      url: 'settings.html',
      x: 64,
      y: 64,
      width: 640,
      height: 440,
      resizable: false,
      title: "Settings",
      fullscreen: false,
    });

    settingsWindow.once('tauri://created', function () {
      console.log('tauri://created');
      settingOpened = true;
    });
    settingsWindow.once('tauri://destroyed', function () {
      console.log('tauri://destroyed');
      settingOpened = false;
    });
  }
}