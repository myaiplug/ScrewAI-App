const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('screwai', {
  // Window controls
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  
  // File operations
  selectAudio: () => ipcRenderer.invoke('select-audio'),
  selectOutput: () => ipcRenderer.invoke('select-output'),
  
  // Strain operations
  getStrains: () => ipcRenderer.invoke('get-strains'),
  processAudio: (data) => ipcRenderer.invoke('process-audio', data),
  
  // Licensing
  getLicenseStatus: () => ipcRenderer.invoke('get-license-status'),
  activateLicense: (data) => ipcRenderer.invoke('activate-license', data),
  deactivateLicense: () => ipcRenderer.invoke('deactivate-license'),
  
  // Progress listener
  onProgress: (callback) => {
    ipcRenderer.on('process-progress', (event, data) => callback(data));
  }
});
