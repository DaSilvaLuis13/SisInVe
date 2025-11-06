const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // para que React funcione bien
    },
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));

  // Siempre mantener focus cuando cambie a fullscreen
  win.on('enter-full-screen', () => win.focus());
  win.on('leave-full-screen', () => win.focus());

  // Opción: abrir DevTools
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  // Registrar atajo para alternar fullscreen (F11)
  globalShortcut.register('F11', () => {
    if (win) {
      win.setFullScreen(!win.isFullScreen());
      win.focus(); // asegura que siga recibiendo teclado
    }
  });

  // Reactivar la app si no hay ventanas
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Cerrar la app correctamente
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Limpiar atajos al cerrar la app
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
