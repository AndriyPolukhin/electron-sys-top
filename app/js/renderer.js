const settingsForm = document.getElementById('settings-form');
const nav = document.getElementById('nav');
// * Get settings
ipcRenderer.on('settings:get', (e, settings) => {
  document.getElementById('cpu-overload').value = settings.cpuOverload;
  document.getElementById('alert-frequency').value = settings.alertFrequency;
});

// * Submit settings
settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const cpuOverload = document.getElementById('cpu-overload').value;
  const alertFrequency = document.getElementById('alert-frequency').value;

  // * Send new settings to main process
  ipcRenderer.send('settings:set', {
    cpuOverload,
    alertFrequency,
  });

  showAlert('Settings Saved');
});

// * Helpers @fn:
// * 1. Show Alert
function showAlert(msg) {
  const alert = document.getElementById('alert');
  alert.classList.remove('hide');
  alert.classList.add('alert');
  alert.innerText = msg;

  setTimeout(() => alert.classList.add('hide'), 3000);
}

// * 2. Toggle navigation
ipcRenderer.on('nav:toggle', () => {
  nav.classList.toggle('hide');
});
