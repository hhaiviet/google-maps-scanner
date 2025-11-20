// background.js - Service Worker for Chrome Extension

class BackgroundService {
    constructor() {
        this.setupListeners();
        this.setupAlarms();
    }

    setupListeners() {
        // Installation
        chrome.runtime.onInstalled.addListener((details) => this.handleInstalled(details));

        // Messages
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open for async response
        });

        // Context Menu
        chrome.contextMenus.onClicked.addListener((info, tab) => this.handleContextMenu(info, tab));

        // Storage Changes
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'local' && changes.scannedData) {
                this.updateBadge();
            }
        });
    }

    setupAlarms() {
        chrome.alarms.create('cleanup', { periodInMinutes: 10080 }); // 7 days
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'cleanup') {
                this.cleanupOldData();
            }
        });
    }

    async handleInstalled(details) {
        if (details.reason === 'install') {
            console.log('🎉 Google Maps Scanner Pro installed!');

            await chrome.storage.local.set({
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

            chrome.tabs.create({ url: 'https://www.google.com/maps' });

            // Create Context Menu
            chrome.contextMenus.create({
                id: 'scanCurrentArea',
                title: 'Scan khu vực này',
                contexts: ['page'],
                documentUrlPatterns: ['https://www.google.com/maps/*', 'https://www.google.com.vn/maps/*']
            });
        }
        this.updateBadge();
    }

    handleMessage(message, sender, sendResponse) {
        console.log('Background received message:', message);

        switch (message.action) {
            case 'saveProgress':
                this.saveProgress(message.data)
                    .then(() => sendResponse({ success: true }))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                break;

            case 'getStats':
                this.getStats()
                    .then(stats => sendResponse({ success: true, stats }))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                break;

            case 'updateStats':
                this.updateStats(message.stats)
                    .then(() => sendResponse({ success: true }))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                break;
        }
    }

    handleContextMenu(info, tab) {
        if (info.menuItemId === 'scanCurrentArea') {
            chrome.action.openPopup();
        }
    }

    async saveProgress(data) {
        try {
            const result = await chrome.storage.local.get(['scannedData']);
            const existingData = result.scannedData || [];
            const newData = [...existingData, ...data];

            await chrome.storage.local.set({ scannedData: newData });
            console.log('💾 Progress saved:', newData.length, 'places');
        } catch (error) {
            console.error('Error saving progress:', error);
            throw error;
        }
    }

    async getStats() {
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

    async updateStats(newStats) {
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

    async cleanupOldData() {
        try {
            const result = await chrome.storage.local.get(['scannedData']);
            const data = result.scannedData || [];

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

    async updateBadge() {
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
}

// Initialize
const backgroundService = new BackgroundService();
console.log('🚀 Google Maps Scanner Pro - Background Service Worker Ready!');
