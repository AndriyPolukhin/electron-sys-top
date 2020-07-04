// * Creating the monitoring process
// * 1. Dependencies
const path = require('path');
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;
const { ipcRenderer } = require('electron');

// * Cpu Overload Settings
let cpuOverload;
let alertFrequency;

// * Get settings a& values
ipcRenderer.on('settings:get', (e, settings) => {
  cpuOverload = +settings.cpuOverload;
  alertFrequency = +settings.alertFrequency;
});

// * System Info
// * 1. Run every 2 seconds for dynamic values
setInterval(() => {
  // * CPU Usage
  cpu.usage().then((info) => {
    document.getElementById('cpu-usage').innerText = info + '%';
    const progress = document.getElementById('cpu-progress');
    progress.style.width = info + '%';

    // * Make progress bar red if overload
    if (info >= cpuOverload) {
      progress.style.background = 'red';
    } else {
      progress.style.background = '#30c88b';
    }
    // * Check Overload
    if (info >= cpuOverload && runNotify(alertFrequency)) {
      notifyUser({
        title: 'CPU Overload',
        body: `CPU is over ${cpuOverload}%`,
        icon: path.join(__dirname, 'img', 'icon.png'),
      });

      localStorage.setItem('lastNotify', +new Date());
    }
  });
  // * CPU Free
  cpu.free().then((info) => {
    document.getElementById('cpu-free').innerText = info + '%';
  });

  // * Uptime
  document.getElementById('sys-uptime').innerText = secondsToDhms(os.uptime());
}, 2000);

// * 2. Set Model
document.getElementById('cpu-model').innerText = cpu.model();

// * 3. Computer Name
document.getElementById('comp-name').innerHTML = os.hostname();

// * 4. OS
document.getElementById('os').innerHTML = `${os.type()} ${os.arch()}`;

// * 5. Total Memory
mem.info().then((info) => {
  document.getElementById('mem-total').innerText = info.totalMemMb;
});

// * Helper @fn:

// * 1. Show days, hours, min, sec
function secondsToDhms(seconds) {
  seconds = +seconds;
  const d = Math.floor(seconds / (3600 / 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${d}d, ${h}h, ${m}m, ${s}s`;
}

// * 2. Send Notification
function notifyUser(options) {
  const notification = new Notification(options.title, options);
  console.log(notification);
  return notification;
}

// * 3. Check how much time has passed after the last notification
function runNotify(frequency) {
  if (localStorage.getItem('lastNotify') === null) {
    // * Store a timestamp
    localStorage.setItem('lastNotify', +new Date());
    return true;
  }
  const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')));
  const now = new Date();
  const diffTime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(diffTime / (1000 * 60));

  return minutesPassed > frequency ? true : false;
}
