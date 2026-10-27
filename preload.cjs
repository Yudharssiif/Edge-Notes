const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setExpand: (expanded) => ipcRenderer.send('set-expand', expanded),
  setDock: (position) => ipcRenderer.send('set-dock', position),
  getDock: () => ipcRenderer.invoke('get-dock'),
  closeApp: () => ipcRenderer.send('close-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
});
