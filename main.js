// main.js - Entry point

const scanner = new MapsScanner();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startScan') {
        scanner.start(message.settings);
        sendResponse({ success: true });
    } else if (message.action === 'stopScan') {
        scanner.stop();
        sendResponse({ success: true });
    }
    return true;
});
