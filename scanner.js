// scanner.js - Main Scanner Logic

class MapsScanner {
    constructor() {
        this.isScanning = false;
        this.scannedPlaces = new Set();
        this.allPlacesData = [];
        this.settings = {};
        this.extractor = new PlaceExtractor();
        this.scroller = null;
    }

    async start(settings) {
        try {
            this.isScanning = true;
            this.settings = settings;
            this.scannedPlaces.clear();
            this.allPlacesData = [];
            this.scroller = new AutoScroller(settings);

            console.log('🚀 Starting Google Maps scan...');

            const sidebar = await Utils.waitForElement(SELECTORS.sidebar, 10000);
            if (!sidebar) {
                throw new Error('Không tìm thấy kết quả tìm kiếm. Vui lòng tìm kiếm trước!');
            }

            await this._scanLoop(sidebar);
            await this._saveData();

            chrome.runtime.sendMessage({
                action: 'scanComplete',
                total: this.allPlacesData.length
            });

            console.log('✅ Scan completed!', this.allPlacesData.length, 'places found');

        } catch (error) {
            console.error('❌ Scan error:', error);
            chrome.runtime.sendMessage({
                action: 'scanError',
                error: error.message
            });
        } finally {
            this.isScanning = false;
        }
    }

    stop() {
        this.isScanning = false;
    }

    async _scanLoop(sidebar) {
        while (this.isScanning && this.scannedPlaces.size < this.settings.maxResults) {
            const placeElements = sidebar.querySelectorAll(SELECTORS.placeLink);
            console.log(`📍 Found ${placeElements.length} place elements on screen`);

            let newPlacesFound = 0;
            for (const element of placeElements) {
                if (!this.isScanning) break;
                if (this.scannedPlaces.size >= this.settings.maxResults) break;

                const placeId = Utils.extractPlaceId(element.href);
                if (!placeId || this.scannedPlaces.has(placeId)) continue;

                const basicData = this.extractor.extractBasic(element);
                if (basicData) {
                    this.scannedPlaces.add(placeId);
                    this.allPlacesData.push(basicData);
                    newPlacesFound++;

                    chrome.runtime.sendMessage({
                        action: 'updateProgress',
                        count: this.scannedPlaces.size
                    });
                }
            }

            console.log(`✨ Collected ${newPlacesFound} new places. Total: ${this.scannedPlaces.size}`);

            // Scroll
            const shouldContinue = await this.scroller.scroll(sidebar, placeElements.length);
            if (!shouldContinue) break;
        }

        // Detailed Extraction (if enabled)
        if (this.settings.detailLevel === 'full' && this.isScanning) {
            console.log('🔍 Collecting detailed information...');
            await this._collectDetailedInfo(sidebar);
        }
    }

    async _collectDetailedInfo(sidebar) {
        // Re-query elements to ensure they are fresh
        const placeElements = Array.from(sidebar.querySelectorAll(SELECTORS.placeLink));

        for (let i = 0; i < placeElements.length && this.isScanning; i++) {
            const element = placeElements[i];
            const placeId = Utils.extractPlaceId(element.href);

            // Find corresponding data
            const index = this.allPlacesData.findIndex(p => p.placeId === placeId);
            if (index === -1) continue;

            const place = this.allPlacesData[index];

            // Skip if we already have good data
            if (place.phone && place.website) continue;

            console.log(`\n🎯 [${i + 1}/${placeElements.length}] Processing: ${place.name}`);

            try {
                // Click to open details (SPA navigation)
                element.click();

                // Wait for load
                const loaded = await this._waitForPlaceLoad(placeId);
                if (!loaded) {
                    console.log('   ❌ Failed to load place details');
                    continue;
                }

                // Extract
                const detailedData = await this.extractor.extractDetailed();

                // Update data
                if (detailedData.phone) this.allPlacesData[index].phone = detailedData.phone;
                if (detailedData.website) this.allPlacesData[index].website = detailedData.website;
                if (detailedData.address && detailedData.address.length > (this.allPlacesData[index].address?.length || 0)) {
                    this.allPlacesData[index].address = detailedData.address;
                }
                if (detailedData.hours) this.allPlacesData[index].hours = detailedData.hours;

                // Go back using UI button
                await this._goBackToList();

            } catch (error) {
                console.error(`   ❌ Error processing place:`, error);
                // Try to recover
                await this._goBackToList();
            }
        }
    }

    async _waitForPlaceLoad(placeId) {
        let attempts = 0;
        while (attempts < 30) {
            await Utils.sleep(300);
            attempts++;

            const currentUrl = window.location.href;
            const isOnCorrectPlace = currentUrl.includes('/maps/place/') && currentUrl.includes(placeId);
            const hasDetailsPanel = document.querySelector(SELECTORS.panel);

            if (isOnCorrectPlace && hasDetailsPanel) return true;
        }
        return false;
    }

    async _goBackToList() {
        const backBtn = document.querySelector(SELECTORS.backButton);
        if (backBtn) {
            backBtn.click();
            await this._waitForListLoad();
        } else {
            console.log('   ⚠️ Back button not found, trying history.back()');
            window.history.back();
            await this._waitForListLoad();
        }
    }

    async _waitForListLoad() {
        let attempts = 0;
        while (attempts < 25) {
            await Utils.sleep(300);
            attempts++;

            if (!window.location.href.includes('/maps/place/')) return true;
        }
        return false;
    }

    async _saveData() {
        // Send data to background script to save
        chrome.runtime.sendMessage({
            action: 'saveProgress',
            data: this.allPlacesData
        });
    }
}
