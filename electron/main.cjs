const { app, BrowserWindow, Menu, shell, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Direct requirement of studio API server to ensure 100% reliable local server availability
try {
  require('../studio/server.cjs');
} catch (err) {
  console.error('Studio server start error:', err);
}

const ABSOLUTE_PROJECT_DIR = '/Users/srinikethshenoy/Desktop/My_Coding_Projects/MS_Music_Website';

let ROOT_DIR = path.resolve(__dirname, '..');
if (ROOT_DIR.includes('app.asar')) {
  const asarIndex = ROOT_DIR.indexOf('.app/Contents/Resources/app.asar');
  if (asarIndex !== -1) {
    const parentDir = path.resolve(ROOT_DIR.substring(0, asarIndex + 4), '..');
    if (fs.existsSync(path.join(parentDir, 'package.json'))) {
      ROOT_DIR = parentDir;
    } else if (fs.existsSync(ABSOLUTE_PROJECT_DIR)) {
      ROOT_DIR = ABSOLUTE_PROJECT_DIR;
    } else {
      ROOT_DIR = parentDir;
    }
  }
}

if (!fs.existsSync(path.join(ROOT_DIR, 'package.json')) && fs.existsSync(ABSOLUTE_PROJECT_DIR)) {
  ROOT_DIR = ABSOLUTE_PROJECT_DIR;
}
let mainWindow = null;
const SERVER_PORT = 3001;

function createWindow() {
  const iconPath = path.join(ROOT_DIR, 'build', 'icon.png');
  const appIcon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : null;

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'MS Music Studio',
    icon: appIcon || undefined,
    backgroundColor: '#09090b',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  const studioUrl = `http://localhost:${SERVER_PORT}?mode=studio`;

  const loadAppUrl = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.loadURL(studioUrl).catch(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        setTimeout(loadAppUrl, 300);
      }
    });
  };

  setTimeout(loadAppUrl, 300);

  // Application menu
  const menuTemplate = [
    {
      label: 'MS Music Studio',
      submenu: [
        { label: 'About MS Music Studio', role: 'about' },
        { type: 'separator' },
        { label: 'Hide MS Music Studio', role: 'hide' },
        { label: 'Hide Others', role: 'hideOthers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit Application', role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', role: 'undo' },
        { label: 'Redo', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', role: 'cut' },
        { label: 'Copy', role: 'copy' },
        { label: 'Paste', role: 'paste' },
        { label: 'Select All', role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload App', role: 'reload' },
        { label: 'Toggle Full Screen', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Developer Tools', role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Website Actions',
      submenu: [
        {
          label: 'Open Live Website in Browser',
          click: () => shell.openExternal('https://sriniketh-m-shenoy.github.io/MS_Music.Com/')
        },
        {
          label: 'Open GitHub Repository',
          click: () => shell.openExternal('https://github.com/Sriniketh-M-Shenoy/MS_Music.Com')
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'User Guide',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'MS Music Studio Guide',
                message: 'How to manage Muralidhar Shenoy Music Website:\n\n1. Edit text, photos, songs, or concert dates in the Visual Studio.\n2. Click "Publish to Website" at the top right when ready.\n3. The app will save your changes and publish live automatically!',
                buttons: ['OK']
              });
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const iconPath = path.join(ROOT_DIR, 'build', 'icon.png');
  if (process.platform === 'darwin' && app.dock && fs.existsSync(iconPath)) {
    try {
      app.dock.setIcon(nativeImage.createFromPath(iconPath));
    } catch (e) {}
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
