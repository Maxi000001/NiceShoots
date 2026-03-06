const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('niceshoot', {
  setPanelOpen: (open) => ipcRenderer.invoke('set-panel-open', open),
  setIgnoreMouse: (ignore) => ipcRenderer.invoke('set-ignore-mouse-events', ignore),
  onToggleSettings: (callback) => {
    ipcRenderer.on('toggle-settings', callback);
  },
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (data) => ipcRenderer.send('save-settings', data),
  quitApp: () => ipcRenderer.send('quit-app')
});
