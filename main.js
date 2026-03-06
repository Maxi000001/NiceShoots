const { app, BrowserWindow, screen, ipcMain, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow = null;
let tray = null;
let keepOnTopInterval = null;

const SETTINGS_FILENAME = 'settings.json';

function getSettingsPath() {
  return path.join(app.getPath('userData'), SETTINGS_FILENAME);
}

function loadSettings() {
  const filePath = getSettingsPath();
  const defaults = {
    size: 24,
    color: '#00FF00',
    opacity: 100,
    styleIndex: 0,
    xOffset: 0,
    yOffset: 0,
    thickness: 2,
    fillEnabled: true,
    outlineEnabled: true,
    outlineColor: '#000000',
    outlineThickness: 1,
    glowEnabled: false,
    glowColor: '#00FF00',
    glowIntensity: 8
  };
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return {
      size: typeof data.size === 'number' ? data.size : defaults.size,
      color: typeof data.color === 'string' ? data.color : defaults.color,
      opacity: typeof data.opacity === 'number' ? data.opacity : defaults.opacity,
      styleIndex: typeof data.styleIndex === 'number' ? data.styleIndex : defaults.styleIndex,
      xOffset: typeof data.xOffset === 'number' ? data.xOffset : defaults.xOffset,
      yOffset: typeof data.yOffset === 'number' ? data.yOffset : defaults.yOffset,
      thickness: typeof data.thickness === 'number' ? data.thickness : defaults.thickness,
      fillEnabled: typeof data.fillEnabled === 'boolean' ? data.fillEnabled : defaults.fillEnabled,
      outlineEnabled: typeof data.outlineEnabled === 'boolean' ? data.outlineEnabled : defaults.outlineEnabled,
      outlineColor: typeof data.outlineColor === 'string' ? data.outlineColor : defaults.outlineColor,
      outlineThickness: typeof data.outlineThickness === 'number' ? data.outlineThickness : defaults.outlineThickness,
      glowEnabled: typeof data.glowEnabled === 'boolean' ? data.glowEnabled : defaults.glowEnabled,
      glowColor: typeof data.glowColor === 'string' ? data.glowColor : defaults.glowColor,
      glowIntensity: typeof data.glowIntensity === 'number' ? data.glowIntensity : defaults.glowIntensity
    };
  } catch {
    return defaults;
  }
}

function saveSettings(data) {
  const filePath = getSettingsPath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('NiceShoot: failed to save settings', err);
  }
}

function sendToggleSettings() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('toggle-settings');
  }
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.ico');
  let icon = null;

  if (fs.existsSync(iconPath)) {
    icon = iconPath;
  } else {
    console.warn('NiceShoot: assets/icon.ico not found, using default tray icon.');
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip('NiceShoot - Crosshair Overlay');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings (F2)',
      click: sendToggleSettings
    },
    { type: 'separator' },
    {
      label: 'Exit NiceShoot',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    sendToggleSettings();
  });
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    type: 'toolbar',
    focusable: false,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    resizable: false,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setContentProtection(false);

  if (keepOnTopInterval) clearInterval(keepOnTopInterval);
  keepOnTopInterval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    } else {
      clearInterval(keepOnTopInterval);
      keepOnTopInterval = null;
    }
  }, 2000);

  mainWindow.on('closed', () => {
    if (keepOnTopInterval) {
      clearInterval(keepOnTopInterval);
      keepOnTopInterval = null;
    }
  });

  // State A (Playing): click-through by default
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Renderer tells main when panel opens/closes (used to receive events when open so hover can work)
  ipcMain.handle('set-panel-open', (_event, open) => {
    if (!mainWindow) return;
    if (open) {
      mainWindow.setIgnoreMouseEvents(false);
    } else {
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    }
  });

  // Hover-based click-through: only interactive when mouse is over panel or toggle
  ipcMain.handle('set-ignore-mouse-events', (_event, ignore) => {
    if (!mainWindow) return;
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
  });

  ipcMain.handle('get-settings', () => loadSettings());
  ipcMain.on('save-settings', (_event, data) => saveSettings(data));
  ipcMain.on('quit-app', () => app.quit());

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // F2: toggle between Playing (panel hidden, click-through) and Configuring (panel visible, interactive)
  globalShortcut.register('F2', sendToggleSettings);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  app.quit();
});
