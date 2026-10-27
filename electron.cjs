const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const AutoLaunch = require('auto-launch');

let win = null;
let currentDock = 'right'; // 'right' | 'left' | 'top'
let isExpanded = false;

const DOCK_SIZES = {
  right: { expanded: { width: 340, height: 520 }, collapsed: { width: 8, height: 520 } },
  left: { expanded: { width: 340, height: 520 }, collapsed: { width: 8, height: 520 } },
  top: { expanded: { width: 420, height: 380 }, collapsed: { width: 420, height: 8 } },
};

function calculateBounds(dock, expanded) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x: wax, y: way, width: waw, height: wah } = primaryDisplay.workArea;
  const config = DOCK_SIZES[dock] || DOCK_SIZES.right;
  const size = expanded ? config.expanded : config.collapsed;

  let x = wax;
  let y = way;

  if (dock === 'right') {
    x = wax + waw - size.width;
    y = way + Math.round((wah - size.height) / 2);
  } else if (dock === 'left') {
    x = wax;
    y = way + Math.round((wah - size.height) / 2);
  } else if (dock === 'top') {
    x = wax + Math.round((waw - size.width) / 2);
    y = way;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: size.width,
    height: size.height,
  };
}

function updateWindowBounds() {
  if (!win) return;
  const bounds = calculateBounds(currentDock, isExpanded);
  win.setBounds(bounds);
}

function setupAutoLaunch() {
  try {
    const autoLauncher = new AutoLaunch({
      name: 'EdgeNotes',
      path: app.getPath('exe'),
    });

    if (app.isPackaged) {
      autoLauncher.isEnabled().then((isEnabled) => {
        if (!isEnabled) {
          autoLauncher.enable().catch((err) => {
            console.warn('[AutoLaunch] Could not enable:', err.message);
          });
        }
      }).catch((err) => {
        console.warn('[AutoLaunch] Error checking status:', err.message);
      });
    }
  } catch (err) {
    console.warn('[AutoLaunch] Setup error:', err.message);
  }
}

function createWindow() {
  const initialBounds = calculateBounds(currentDock, isExpanded);

  win = new BrowserWindow({
    ...initialBounds,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setAlwaysOnTop(true, 'floating');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const isDev = !app.isPackaged;
  if (isDev) {
    const loadDev = () => {
      win.loadURL('http://localhost:5173').catch(() => {
        setTimeout(loadDev, 500);
      });
    };
    loadDev();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  win.once('ready-to-show', () => {
    updateWindowBounds();
    win.show();
  });

  // Handle display changes (resolution change, taskbar resize, etc.)
  screen.on('display-metrics-changed', () => {
    updateWindowBounds();
  });
}

// IPC handlers
ipcMain.on('set-expand', (event, expand) => {
  if (isExpanded === expand) return;
  isExpanded = expand;
  updateWindowBounds();
});

ipcMain.on('set-dock', (event, dock) => {
  if (!['left', 'right', 'top'].includes(dock)) return;
  currentDock = dock;
  updateWindowBounds();
});

ipcMain.handle('get-dock', () => {
  return currentDock;
});

ipcMain.on('close-app', () => {
  if (win) {
    win.close();
  }
  app.quit();
});

ipcMain.on('minimize-app', () => {
  if (win) {
    win.minimize();
  }
});

app.whenReady().then(() => {
  createWindow();
  setupAutoLaunch();

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
