// background.js - Service Worker cho Chrome Extension

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('🎉 Google Maps Scanner Pro installed!');
        
        // Khởi tạo storage
        chrome.storage.local.set({
            scannedData: [],
            scanSettings: {
                maxResults: 50,
                scrollDelay: 2000,
                detailLevel: 'full'
            },
            stats: {
                totalScans: 0,
                totalPlaces: 0,
                lastScanDate: null
            }
        });

        // Mở trang hướng dẫn
        chrome.tabs.create({
            url: 'https://www.google.com/maps'
        });
    }
});

// Listen for messages từ content script và popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);

    if (message.action === 'saveProgress') {
        // Lưu tiến trình scan
        handleSaveProgress(message.data)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (message.action === 'getStats') {
        // Lấy thống kê
        getStats()
            .then(stats => sendResponse({ success: true, stats }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (message.action === 'updateStats') {
        // Cập nhật thống kê
        updateStats(message.stats)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

// Lưu tiến trình
async function handleSaveProgress(data) {
    try {
        const result = await chrome.storage.local.get(['scannedData']);
        const existingData = result.scannedData || [];
        
        // Merge data
        const newData = [...existingData, ...data];
        
        await chrome.storage.local.set({ scannedData: newData });
        console.log('💾 Progress saved:', newData.length, 'places');
        
    } catch (error) {
        console.error('Error saving progress:', error);
        throw error;
    }
}

// Lấy thống kê
async function getStats() {
    try {
        const result = await chrome.storage.local.get(['stats', 'scannedData']);
        const stats = result.stats || {};
        const data = result.scannedData || [];
        
        return {
            totalScans: stats.totalScans || 0,
            totalPlaces: data.length,
            lastScanDate: stats.lastScanDate,
            dataSize: new Blob([JSON.stringify(data)]).size
        };
        
    } catch (error) {
        console.error('Error getting stats:', error);
        throw error;
    }
}

// Cập nhật thống kê
async function updateStats(newStats) {
    try {
        const result = await chrome.storage.local.get(['stats']);
        const currentStats = result.stats || {};
        
        const updatedStats = {
            ...currentStats,
            ...newStats,
            lastUpdated: new Date().toISOString()
        };
        
        await chrome.storage.local.set({ stats: updatedStats });
        console.log('📊 Stats updated:', updatedStats);
        
    } catch (error) {
        console.error('Error updating stats:', error);
        throw error;
    }
}

// Listen for tab updates để inject content script nếu cần
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('google.com/maps')) {
        console.log('📍 Google Maps tab detected:', tabId);
    }
});

// Tự động dọn dẹp dữ liệu cũ (mỗi 7 ngày)
chrome.alarms.create('cleanup', { periodInMinutes: 10080 }); // 7 days

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanup') {
        cleanupOldData();
    }
});

async function cleanupOldData() {
    try {
        const result = await chrome.storage.local.get(['scannedData']);
        const data = result.scannedData || [];
        
        // Xóa dữ liệu cũ hơn 30 ngày
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const cleanedData = data.filter(place => {
            const placeDate = new Date(place.timestamp);
            return placeDate > thirtyDaysAgo;
        });
        
        if (cleanedData.length < data.length) {
            await chrome.storage.local.set({ scannedData: cleanedData });
            console.log('🧹 Cleaned up old data:', data.length - cleanedData.length, 'places removed');
        }
        
    } catch (error) {
        console.error('Error cleaning up data:', error);
    }
}

// Context menu (right-click menu)
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'scanCurrentArea',
        title: 'Scan khu vực này',
        contexts: ['page'],
        documentUrlPatterns: ['https://www.google.com/maps/*', 'https://www.google.com.vn/maps/*']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'scanCurrentArea') {
        // Mở popup hoặc bắt đầu scan
        chrome.action.openPopup();
    }
});

// Badge để hiển thị số lượng places đã scan
async function updateBadge() {
    try {
        const result = await chrome.storage.local.get(['scannedData']);
        const data = result.scannedData || [];
        
        if (data.length > 0) {
            chrome.action.setBadgeText({ text: data.length.toString() });
            chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
        } else {
            chrome.action.setBadgeText({ text: '' });
        }
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}

// Cập nhật badge mỗi khi có thay đổi
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.scannedData) {
        updateBadge();
    }
});

// Update badge khi khởi động
updateBadge();

console.log('🚀 Google Maps Scanner Pro - Background Service Worker Ready!');
