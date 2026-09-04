const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1300,
        height: 850,
        minWidth: 420,
        minHeight: 680,
        title: 'My Klepeh E-Wallet Premium',
        backgroundColor: '#0b0f19',
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            spellcheck: false
        }
    });

    // Menghilangkan menu bar default agar tampilan bersih seperti aplikasi native
    Menu.setApplicationMenu(null);

    // Memuat halaman utama (login.html)
    mainWindow.loadFile(path.join(__dirname, 'login.html'));

    // Tampilkan jendela secara mulus setelah konten selesai dimuat
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Buka tautan eksternal (http/https keluar) di browser default pengguna
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// IPC Handlers untuk kontrol window jika dipanggil dari renderer
ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
});

// Siklus hidup aplikasi
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
