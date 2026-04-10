// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Expose API ra cho Window
contextBridge.exposeInMainWorld("electronAPI", {
  saveGraph: (data) => ipcRenderer.invoke("save-graph-state", data),
  loadGraph: () => ipcRenderer.invoke("load-graph-state"),
});
