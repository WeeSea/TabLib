// Background service worker for TabLib
// Handle keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-tab-manager') {
    chrome.tabs.create({ url: 'tabmanager.html' });
  }
});

// Handle toolbar icon click
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'tabmanager.html' });
});

// Messaging to tabmanager pages
let ports = [];

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'tabmanager') {
    ports.push(port);
    port.onDisconnect.addListener(() => {
      ports = ports.filter((p) => p !== port);
    });
  }
});

function notifyTabManager() {
  for (const port of ports) {
    port.postMessage({ action: 'updateTabs' });
  }
}

// Listen for tab changes
chrome.tabs.onCreated.addListener(notifyTabManager);
chrome.tabs.onUpdated.addListener(notifyTabManager);
chrome.tabs.onRemoved.addListener(notifyTabManager);
chrome.tabs.onMoved.addListener(notifyTabManager);
chrome.tabs.onAttached.addListener(notifyTabManager);
chrome.tabs.onDetached.addListener(notifyTabManager);
