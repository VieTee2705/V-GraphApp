import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Khởi tạo biến giữ cửa sổ chính
let mainWindow;

// Handle __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Nếu đang ở chế độ Dev (chạy npm run dev) -> Load server của Vite
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Mở DevTools (F12) tự động nếu muốn
    mainWindow.webContents.openDevTools();
  } else {
    // Nếu ở chế độ Build -> Load file index.html đã được compile
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// Khi Electron đã sẵn sàng
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Đóng app khi tắt hết cửa sổ (trên Windows/Linux)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
