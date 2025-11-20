// popup.js - Logic điều khiển giao diện extension

class PopupController {
    constructor() {
        this.isScanning = false;
        this.elements = {
            startBtn: document.getElementById('startScan'),
            stopBtn: document.getElementById('stopScan'),
            exportCSVBtn: document.getElementById('exportCSV'),
            exportJSONBtn: document.getElementById('exportJSON'),
            clearDataBtn: document.getElementById('clearData'),
            statusText: document.getElementById('status'),
            scannedCount: document.getElementById('scannedCount'),
            totalSaved: document.getElementById('totalSaved'),
            progressBar: document.getElementById('progressBar'),
            progressFill: document.getElementById('progressFill'),
            logContainer: document.getElementById('logContainer'),
            maxResults: document.getElementById('maxResults'),
            scrollDelay: document.getElementById('scrollDelay'),
            detailLevel: document.getElementById('detailLevel')
        };
    }

    async init() {
        await this.loadStats();
        await this.loadSettings();
        this.setupEventListeners();
        this.setupMessageListener();
    }

    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startScanning());
        this.elements.stopBtn.addEventListener('click', () => this.stopScanning());
        this.elements.exportCSVBtn.addEventListener('click', () => this.exportData('csv'));
        this.elements.exportJSONBtn.addEventListener('click', () => this.exportData('json'));
        this.elements.clearDataBtn.addEventListener('click', () => this.clearAllData());

        // Settings listeners
        this.elements.maxResults.addEventListener('change', () => this.saveSettings());
        this.elements.scrollDelay.addEventListener('change', () => this.saveSettings());
        this.elements.detailLevel.addEventListener('change', () => this.saveSettings());
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'updateProgress') {
                this.updateProgress(message.count);
            } else if (message.action === 'scanComplete') {
                this.handleScanComplete(message.total);
            } else if (message.action === 'scanError') {
                this.handleScanError(message.error);
            }
        });
    }

    async startScanning() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.url.includes('google.com/maps')) {
                this.updateStatus('❌ Vui lòng mở Google Maps trước!', 'error');
                return;
            }

            this.isScanning = true;
            this.setScanningUI(true);

            const settings = {
                maxResults: parseInt(this.elements.maxResults.value),
                scrollDelay: parseInt(this.elements.scrollDelay.value),
                detailLevel: this.elements.detailLevel.value
            };

            this.updateStatus('🔄 Đang scan...', 'scanning');
            this.addLog('Bắt đầu quá trình scan...');

            await chrome.tabs.sendMessage(tab.id, {
                action: 'startScan',
                settings: settings
            });

        } catch (error) {
            console.error('Error starting scan:', error);
            this.updateStatus('❌ Lỗi: ' + error.message, 'error');
            this.resetUI();
        }
    }

    async stopScanning() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, { action: 'stopScan' });

            this.updateStatus('⏸️ Đã dừng scan', 'stopped');
            this.addLog('Đã dừng scan bởi người dùng');
            this.resetUI();

        } catch (error) {
            console.error('Error stopping scan:', error);
            this.resetUI();
        }
    }

    async exportData(format) {
        try {
            this.updateStatus(`📤 Đang export ${format.toUpperCase()}...`, 'exporting');

            const result = await chrome.storage.local.get(['scannedData']);
            const data = result.scannedData || [];

            if (data.length === 0) {
                this.updateStatus('⚠️ Không có dữ liệu để export!', 'warning');
                setTimeout(() => this.updateStatus('⏸️ Sẵn sàng để scan', 'ready'), 2000);
                return;
            }

            if (format === 'csv') {
                this.exportToCSV(data);
            } else if (format === 'json') {
                this.exportToJSON(data);
            }

            this.updateStatus(`✅ Đã export ${data.length} địa điểm!`, 'success');
            this.addLog(`Export thành công ${data.length} địa điểm dạng ${format.toUpperCase()}`);

            setTimeout(() => this.updateStatus('⏸️ Sẵn sàng để scan', 'ready'), 2000);

        } catch (error) {
            console.error('Error exporting data:', error);
            this.updateStatus('❌ Lỗi khi export!', 'error');
        }
    }

    exportToCSV(data) {
        const headers = [
            'Tên', 'Địa chỉ', 'Điện thoại', 'Website', 'Rating',
            'Số đánh giá', 'Loại hình', 'Giờ mở cửa',
            'Latitude', 'Longitude', 'Place ID', 'URL'
        ];

        let csv = headers.join(',') + '\n';

        data.forEach(place => {
            const row = [
                this.escapeCSV(place.name),
                this.escapeCSV(place.address),
                this.escapeCSV(place.phone),
                this.escapeCSV(place.website),
                place.rating || '',
                place.reviewCount || '',
                this.escapeCSV(place.category),
                this.escapeCSV(place.hours),
                place.latitude || '',
                place.longitude || '',
                this.escapeCSV(place.placeId),
                this.escapeCSV(place.url)
            ];
            csv += row.join(',') + '\n';
        });

        this.downloadFile(csv, 'google-maps-data.csv', 'text/csv');
    }

    exportToJSON(data) {
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, 'google-maps-data.json', 'application/json');
    }

    escapeCSV(value) {
        if (!value) return '""';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return '"' + stringValue.replace(/"/g, '""') + '"';
        }
        return '"' + stringValue + '"';
    }

    downloadFile(content, filename, mimeType) {
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

    async clearAllData() {
        if (!confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu đã scan?')) {
            return;
        }

        try {
            await chrome.storage.local.set({ scannedData: [] });
            this.elements.scannedCount.textContent = '0';
            this.elements.totalSaved.textContent = '0';
            this.updateStatus('🗑️ Đã xóa toàn bộ dữ liệu', 'cleared');
            this.addLog('Đã xóa toàn bộ dữ liệu');

            setTimeout(() => this.updateStatus('⏸️ Sẵn sàng để scan', 'ready'), 2000);
        } catch (error) {
            console.error('Error clearing data:', error);
            this.updateStatus('❌ Lỗi khi xóa dữ liệu!', 'error');
        }
    }

    async loadStats() {
        try {
            const result = await chrome.storage.local.get(['scannedData']);
            const data = result.scannedData || [];
            this.elements.totalSaved.textContent = data.length;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['scanSettings']);
            if (result.scanSettings) {
                this.elements.maxResults.value = result.scanSettings.maxResults || 50;
                this.elements.scrollDelay.value = result.scanSettings.scrollDelay || 2000;
                this.elements.detailLevel.value = result.scanSettings.detailLevel || 'full';
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveSettings() {
        try {
            const settings = {
                maxResults: parseInt(this.elements.maxResults.value),
                scrollDelay: parseInt(this.elements.scrollDelay.value),
                detailLevel: this.elements.detailLevel.value
            };
            await chrome.storage.local.set({ scanSettings: settings });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    updateProgress(count) {
        this.elements.scannedCount.textContent = count;
        const max = parseInt(this.elements.maxResults.value);
        const progress = (count / max) * 100;
        this.elements.progressFill.style.width = Math.min(progress, 100) + '%';
        this.addLog(`Đã scan ${count} địa điểm`);
    }

    handleScanComplete(total) {
        this.elements.totalSaved.textContent = total;
        this.updateStatus(`✅ Hoàn thành! Đã scan ${total} địa điểm`, 'success');
        this.addLog(`Hoàn thành scan: ${total} địa điểm`);
        this.resetUI();
    }

    handleScanError(error) {
        this.updateStatus('❌ Lỗi: ' + error, 'error');
        this.addLog('Lỗi: ' + error);
        this.resetUI();
    }

    updateStatus(text, type) {
        this.elements.statusText.textContent = text;
        this.elements.statusText.className = 'status-text';
        if (type === 'scanning') {
            this.elements.statusText.classList.add('scanning');
        }
    }

    addLog(message) {
        const timestamp = new Date().toLocaleTimeString('vi-VN');
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = `[${timestamp}] ${message}`;
        this.elements.logContainer.insertBefore(logEntry, this.elements.logContainer.firstChild);

        while (this.elements.logContainer.children.length > 50) {
            this.elements.logContainer.removeChild(this.elements.logContainer.lastChild);
        }
    }

    setScanningUI(isScanning) {
        this.elements.startBtn.disabled = isScanning;
        this.elements.stopBtn.disabled = !isScanning;
        this.elements.progressBar.style.display = isScanning ? 'block' : 'none';
        this.elements.logContainer.style.display = isScanning ? 'block' : 'none';
    }

    resetUI() {
        this.isScanning = false;
        this.setScanningUI(false);
        this.elements.progressFill.style.width = '0%';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const popup = new PopupController();
    popup.init();
});
