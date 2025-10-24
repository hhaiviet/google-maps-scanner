// popup.js - Logic điều khiển giao diện extension

let isScanning = false;

// DOM Elements
const startBtn = document.getElementById('startScan');
const stopBtn = document.getElementById('stopScan');
const exportCSVBtn = document.getElementById('exportCSV');
const exportJSONBtn = document.getElementById('exportJSON');
const clearDataBtn = document.getElementById('clearData');
const statusText = document.getElementById('status');
const scannedCount = document.getElementById('scannedCount');
const totalSaved = document.getElementById('totalSaved');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const logContainer = document.getElementById('logContainer');

// Settings
const maxResults = document.getElementById('maxResults');
const scrollDelay = document.getElementById('scrollDelay');
const detailLevel = document.getElementById('detailLevel');

// Khởi tạo
document.addEventListener('DOMContentLoaded', async () => {
    await loadStats();
    await loadSettings();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startScanning);
    stopBtn.addEventListener('click', stopScanning);
    exportCSVBtn.addEventListener('click', () => exportData('csv'));
    exportJSONBtn.addEventListener('click', () => exportData('json'));
    clearDataBtn.addEventListener('click', clearAllData);

    // Lưu settings khi thay đổi
    maxResults.addEventListener('change', saveSettings);
    scrollDelay.addEventListener('change', saveSettings);
    detailLevel.addEventListener('change', saveSettings);
}

// Bắt đầu scan
async function startScanning() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.url.includes('google.com/maps')) {
            updateStatus('❌ Vui lòng mở Google Maps trước!', 'error');
            return;
        }

        isScanning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        progressBar.style.display = 'block';
        logContainer.style.display = 'block';

        const settings = {
            maxResults: parseInt(maxResults.value),
            scrollDelay: parseInt(scrollDelay.value),
            detailLevel: detailLevel.value
        };

        updateStatus('🔄 Đang scan...', 'scanning');
        addLog('Bắt đầu quá trình scan...');

        // Gửi message đến content script
        await chrome.tabs.sendMessage(tab.id, {
            action: 'startScan',
            settings: settings
        });

    } catch (error) {
        console.error('Error starting scan:', error);
        updateStatus('❌ Lỗi: ' + error.message, 'error');
        resetUI();
    }
}

// Dừng scan
async function stopScanning() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        await chrome.tabs.sendMessage(tab.id, {
            action: 'stopScan'
        });

        updateStatus('⏸️ Đã dừng scan', 'stopped');
        addLog('Đã dừng scan bởi người dùng');
        resetUI();

    } catch (error) {
        console.error('Error stopping scan:', error);
        resetUI();
    }
}

// Export dữ liệu
async function exportData(format) {
    try {
        updateStatus(`📤 Đang export ${format.toUpperCase()}...`, 'exporting');
        
        const result = await chrome.storage.local.get(['scannedData']);
        const data = result.scannedData || [];

        if (data.length === 0) {
            updateStatus('⚠️ Không có dữ liệu để export!', 'warning');
            setTimeout(() => updateStatus('⏸️ Sẵn sàng để scan', 'ready'), 2000);
            return;
        }

        if (format === 'csv') {
            exportToCSV(data);
        } else if (format === 'json') {
            exportToJSON(data);
        }

        updateStatus(`✅ Đã export ${data.length} địa điểm!`, 'success');
        addLog(`Export thành công ${data.length} địa điểm dạng ${format.toUpperCase()}`);
        
        setTimeout(() => updateStatus('⏸️ Sẵn sàng để scan', 'ready'), 2000);

    } catch (error) {
        console.error('Error exporting data:', error);
        updateStatus('❌ Lỗi khi export!', 'error');
    }
}

// Export CSV
function exportToCSV(data) {
    const headers = [
        'Tên',
        'Địa chỉ',
        'Điện thoại',
        'Website',
        'Rating',
        'Số đánh giá',
        'Loại hình',
        'Giờ mở cửa',
        'Latitude',
        'Longitude',
        'Place ID',
        'URL'
    ];

    let csv = headers.join(',') + '\n';

    data.forEach(place => {
        const row = [
            escapeCSV(place.name),
            escapeCSV(place.address),
            escapeCSV(place.phone),
            escapeCSV(place.website),
            place.rating || '',
            place.reviewCount || '',
            escapeCSV(place.category),
            escapeCSV(place.hours),
            place.latitude || '',
            place.longitude || '',
            escapeCSV(place.placeId),
            escapeCSV(place.url)
        ];
        csv += row.join(',') + '\n';
    });

    downloadFile(csv, 'google-maps-data.csv', 'text/csv');
}

// Export JSON
function exportToJSON(data) {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, 'google-maps-data.json', 'application/json');
}

// Escape CSV values
function escapeCSV(value) {
    if (!value) return '""';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    return '"' + stringValue + '"';
}

// Download file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Xóa dữ liệu
async function clearAllData() {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu đã scan?')) {
        return;
    }

    try {
        await chrome.storage.local.set({ scannedData: [] });
        scannedCount.textContent = '0';
        totalSaved.textContent = '0';
        updateStatus('🗑️ Đã xóa toàn bộ dữ liệu', 'cleared');
        addLog('Đã xóa toàn bộ dữ liệu');
        
        setTimeout(() => updateStatus('⏸️ Sẵn sàng để scan', 'ready'), 2000);
    } catch (error) {
        console.error('Error clearing data:', error);
        updateStatus('❌ Lỗi khi xóa dữ liệu!', 'error');
    }
}

// Load statistics
async function loadStats() {
    try {
        const result = await chrome.storage.local.get(['scannedData']);
        const data = result.scannedData || [];
        totalSaved.textContent = data.length;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load settings
async function loadSettings() {
    try {
        const result = await chrome.storage.local.get(['scanSettings']);
        if (result.scanSettings) {
            maxResults.value = result.scanSettings.maxResults || 50;
            scrollDelay.value = result.scanSettings.scrollDelay || 2000;
            detailLevel.value = result.scanSettings.detailLevel || 'full';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save settings
async function saveSettings() {
    try {
        const settings = {
            maxResults: parseInt(maxResults.value),
            scrollDelay: parseInt(scrollDelay.value),
            detailLevel: detailLevel.value
        };
        await chrome.storage.local.set({ scanSettings: settings });
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Update status
function updateStatus(text, type) {
    statusText.textContent = text;
    statusText.className = 'status-text';
    if (type === 'scanning') {
        statusText.classList.add('scanning');
    }
}

// Add log entry
function addLog(message) {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = `[${timestamp}] ${message}`;
    logContainer.insertBefore(logEntry, logContainer.firstChild);

    // Giữ tối đa 50 logs
    while (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// Reset UI
function resetUI() {
    isScanning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    progressBar.style.display = 'none';
    progressFill.style.width = '0%';
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateProgress') {
        scannedCount.textContent = message.count;
        const progress = (message.count / parseInt(maxResults.value)) * 100;
        progressFill.style.width = Math.min(progress, 100) + '%';
        addLog(`Đã scan ${message.count} địa điểm`);
    } else if (message.action === 'scanComplete') {
        totalSaved.textContent = message.total;
        updateStatus(`✅ Hoàn thành! Đã scan ${message.total} địa điểm`, 'success');
        addLog(`Hoàn thành scan: ${message.total} địa điểm`);
        resetUI();
    } else if (message.action === 'scanError') {
        updateStatus('❌ Lỗi: ' + message.error, 'error');
        addLog('Lỗi: ' + message.error);
        resetUI();
    }
});
