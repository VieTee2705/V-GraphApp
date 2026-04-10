import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

// Khởi tạo biến giữ cửa sổ chính
let mainWindow;

// Handle __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  // Tự động chọn đúng đường dẫn tùy theo môi trường (Dev hay Build)
  const preloadPath = app.isPackaged
    ? path.join(__dirname, "preload.js")
    : path.join(process.cwd(), "electron/preload.js");

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath, // Sử dụng biến vừa tạo
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

// --- XỬ LÝ IPC CHO AUTO-SAVE ---
const getUserDataPath = () => app.getPath("userData");
const getSaveFilePath = () =>
  path.join(getUserDataPath(), "graph-autosave.json");

// Lắng nghe sự kiện lưu từ Vue
ipcMain.handle("save-graph-state", (event, data) => {
  try {
    const filePath = getSaveFilePath();
    // Ghi dữ liệu ra file JSON
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi lưu đồ thị:", error);
    return { success: false, error: error.message };
  }
});

// Lắng nghe sự kiện tải dữ liệu từ Vue khi mở app
ipcMain.handle("load-graph-state", () => {
  try {
    const filePath = getSaveFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
    return null; // Không có file save cũ
  } catch (error) {
    console.error("Lỗi khi đọc file save:", error);
    return null;
  }
});

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
