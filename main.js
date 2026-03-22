const { app, BrowserWindow } = require("electron");
const path = require("path");

// Kiểm tra xem đang chạy ở chế độ dev hay không?
// Lưu ý: Bạn có thể cài thêm 'electron-is-dev' để check chuẩn hơn
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Lưu ý: Cấu hình này để demo cho dễ, thực tế nên dùng preload script
    },
  });
  if (isDev) {
    // Chế độ Dev: Load URL từ server của Vue (thường là port 5173 nếu dùng Vite, hoặc 8080 nếu dùng Webpack)
    // HÃY KIỂM TRA LẠI PORT VUE CỦA BẠN LÀ GÌ
    win.loadURL("http://localhost:5173");

    // Mở luôn DevTools để debug cho dễ
    win.webContents.openDevTools();
  } else {
    // Chế độ Production: Load file html đã build
    // Đường dẫn này tùy thuộc vào cấu trúc thư mục build (thường là 'dist' hoặc 'build')
    win.loadFile(path.join(__dirname, "dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
