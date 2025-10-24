// content.js - Script chạy trên Google Maps để scan dữ liệu

let isScanning = false;
let scannedPlaces = new Set();
let allPlacesData = [];
let scanSettings = {};

// Listen for messages từ popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startScan') {
        scanSettings = message.settings;
        startScanProcess();
        sendResponse({ success: true });
    } else if (message.action === 'stopScan') {
        isScanning = false;
        sendResponse({ success: true });
    }
    return true;
});

// Bắt đầu quá trình scan
async function startScanProcess() {
    try {
        isScanning = true;
        scannedPlaces.clear();
        allPlacesData = [];

        console.log('🚀 Starting Google Maps scan...');
        console.log('Settings:', scanSettings);

        // Tìm sidebar chứa kết quả
        const sidebar = await waitForElement('[role="feed"]', 10000);
        if (!sidebar) {
            throw new Error('Không tìm thấy kết quả tìm kiếm. Vui lòng tìm kiếm trước!');
        }

        // Bắt đầu scroll và thu thập
        await scrollAndCollect(sidebar);

        // Lưu dữ liệu
        await saveData();

        // Thông báo hoàn thành
        chrome.runtime.sendMessage({
            action: 'scanComplete',
            total: allPlacesData.length
        });

        console.log('✅ Scan completed!', allPlacesData.length, 'places found');

    } catch (error) {
        console.error('❌ Scan error:', error);
        chrome.runtime.sendMessage({
            action: 'scanError',
            error: error.message
        });
    }
}

// Scroll và thu thập dữ liệu
async function scrollAndCollect(sidebar) {
    let scrollAttempts = 0;
    let noNewResultsCount = 0;
    const maxNoNewResults = 5;

    while (isScanning && scannedPlaces.size < scanSettings.maxResults) {
        // Lấy các places hiện tại
        const placeElements = sidebar.querySelectorAll('a[href*="/maps/place/"]');
        
        console.log(`📍 Found ${placeElements.length} place elements on screen`);

        // Thu thập thông tin cơ bản
        let newPlacesFound = 0;
        for (const element of placeElements) {
            if (!isScanning) break;
            if (scannedPlaces.size >= scanSettings.maxResults) break;

            const placeId = extractPlaceId(element.href);
            if (!placeId || scannedPlaces.has(placeId)) continue;

            const basicData = extractBasicData(element);
            if (basicData) {
                scannedPlaces.add(placeId);
                allPlacesData.push(basicData);
                newPlacesFound++;

                // Update progress
                chrome.runtime.sendMessage({
                    action: 'updateProgress',
                    count: scannedPlaces.size
                });
            }
        }

        console.log(`✨ Collected ${newPlacesFound} new places. Total: ${scannedPlaces.size}`);

        // Kiểm tra nếu không có kết quả mới
        if (newPlacesFound === 0) {
            noNewResultsCount++;
            if (noNewResultsCount >= maxNoNewResults) {
                console.log('⚠️ No new results found after multiple scrolls. Stopping...');
                break;
            }
        } else {
            noNewResultsCount = 0;
        }

        // Scroll xuống
        const scrollableDiv = sidebar.querySelector('div[role="feed"]') || sidebar;
        scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
        
        scrollAttempts++;
        console.log(`📜 Scroll attempt ${scrollAttempts}...`);

        // Đợi load thêm kết quả
        await sleep(scanSettings.scrollDelay);
    }

    // Thu thập chi tiết nếu cần
    if (scanSettings.detailLevel === 'full' && isScanning) {
        console.log('🔍 Collecting detailed information...');
        await collectDetailedInfo();
    }
}

// Thu thập thông tin cơ bản
function extractBasicData(element) {
    try {
        const parentDiv = element.closest('div[role="article"]') || element.closest('div.Nv2PK');
        if (!parentDiv) return null;

        const data = {
            placeId: extractPlaceId(element.href),
            name: '',
            address: '',
            rating: null,
            reviewCount: null,
            category: '',
            url: element.href,
            phone: '',
            website: '',
            hours: '',
            foundedYear: null,
            foundedText: '',
            latitude: null,
            longitude: null,
            timestamp: new Date().toISOString()
        };

        // Tên
        const nameElement = parentDiv.querySelector('.fontHeadlineSmall, .qBF1Pd');
        if (nameElement) {
            data.name = nameElement.textContent.trim();
        }

        // Rating và số reviews
        const ratingElement = parentDiv.querySelector('span[role="img"]');
        if (ratingElement) {
            const ariaLabel = ratingElement.getAttribute('aria-label') || '';
            const ratingMatch = ariaLabel.match(/([\d,\.]+)\s*(?:sao|stars?)/i);
            if (ratingMatch) {
                data.rating = parseFloat(ratingMatch[1].replace(',', '.'));
            }
        }

        // Số lượng đánh giá
        const reviewElement = parentDiv.querySelector('span.UY7F9');
        if (reviewElement) {
            const reviewText = reviewElement.textContent;
            const reviewMatch = reviewText.match(/([\d,.]+)/);
            if (reviewMatch) {
                data.reviewCount = parseInt(reviewMatch[1].replace(/[,\.]/g, ''));
            }
        }

        // Category
        const categoryElements = parentDiv.querySelectorAll('.W4Efsd span');
        if (categoryElements.length > 1) {
            data.category = categoryElements[0].textContent.trim();
            // Address thường là element thứ 2 hoặc cuối
            const addressCandidate = Array.from(categoryElements)
                .map(el => el.textContent.trim())
                .find(text => text.includes('·') || text.length > 20);
            if (addressCandidate) {
                data.address = addressCandidate.replace(/^·\s*/, '');
            }
        }

        // Extract coordinates từ URL
        const coords = extractCoordinates(element.href);
        if (coords) {
            data.latitude = coords.lat;
            data.longitude = coords.lng;
        }

        return data;

    } catch (error) {
        console.error('Error extracting basic data:', error);
        return null;
    }
}

// Thu thập thông tin chi tiết bằng cách click vào từng place
async function collectDetailedInfo() {
    const sidebar = document.querySelector('[role="feed"]');
    if (!sidebar) return;

    let detailedCount = 0;
    const totalPlaces = allPlacesData.length;
    
    console.log(`🔍 Starting detailed scan for ${totalPlaces} places...`);
    console.log(`⚠️ This will take ~${Math.ceil(totalPlaces * 4 / 60)} minutes`);
    
    // STRATEGY: Tìm element theo PlaceID thay vì dùng index
    // Vì list có thể reorder, nhưng PlaceID không đổi

    for (let i = 0; i < totalPlaces && isScanning; i++) {
        try {
            const expectedPlaceId = allPlacesData[i].placeId;
            const expectedName = allPlacesData[i].name;
            
            // TÌM element có chứa PlaceID này (với multiple attempts)
            let targetElement = null;
            let findAttempts = 0;
            const maxFindAttempts = 3;
            
            while (!targetElement && findAttempts < maxFindAttempts) {
                findAttempts++;
                
                // Refresh element list mỗi lần tìm
                const placeElements = sidebar.querySelectorAll('a[href*="/maps/place/"]');
                
                for (const el of placeElements) {
                    const elPlaceId = extractPlaceId(el.href);
                    if (elPlaceId === expectedPlaceId) {
                        // Double-check element is visible and clickable
                        const rect = el.getBoundingClientRect();
                        if (rect.height > 0 && rect.width > 0) {
                            targetElement = el;
                            break;
                        }
                    }
                }
                
                if (!targetElement && findAttempts < maxFindAttempts) {
                    console.log(`   🔄 Element not found, attempt ${findAttempts}/${maxFindAttempts}. Refreshing...`);
                    await sleep(1000);
                    
                    // Try scrolling the sidebar a bit to refresh elements
                    if (sidebar.scrollTop > 0) {
                        sidebar.scrollTop -= 100;
                        await sleep(300);
                        sidebar.scrollTop += 100;
                        await sleep(300);
                    }
                }
            }
            
            if (!targetElement) {
                console.log(`\n⚠️ [${i + 1}/${totalPlaces}] Could not find element for: ${expectedName}`);
                console.log(`   PlaceID: ${expectedPlaceId}`);
                console.log(`   Skipping...`);
                continue;
            }

            console.log(`\n📱 [${i + 1}/${totalPlaces}] Clicking: ${expectedName}`);
            console.log(`   Expected PlaceID: ${expectedPlaceId}`);
            console.log(`   Element href: ${targetElement.href}`);
            console.log(`   Element PlaceID: ${extractPlaceId(targetElement.href)}`);

            // Scroll element vào view trước khi click
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(800); // Increased for stability

            // Double-check element still valid before clicking
            const preClickPlaceId = extractPlaceId(targetElement.href);
            if (preClickPlaceId !== expectedPlaceId) {
                console.warn(`⚠️ Element changed before click! Expected ${expectedPlaceId}, found ${preClickPlaceId}`);
                continue;
            }

            // Click vào element
            targetElement.click();
            await sleep(3500); // Increased wait time

            // VERIFY sau khi click - check URL hiện tại
            const currentUrl = window.location.href;
            const currentPlaceId = extractPlaceId(currentUrl);
            
            if (currentPlaceId !== expectedPlaceId) {
                console.error(`❌ Wrong place opened! Expected ${expectedPlaceId}, got ${currentPlaceId}`);
                
                // RETRY LOGIC: Try to click correct place one more time
                let retrySuccess = false;
                
                // Go back first
                const backButton = document.querySelector('button[aria-label*="Back"], button[aria-label*="Quay"]');
                if (backButton) {
                    backButton.click();
                    await sleep(1200); // Wait for navigation
                    
                    // Try to find and click the correct element again
                    const retryPlaceElements = sidebar.querySelectorAll('a[href*="/maps/place/"]');
                    for (const retryEl of retryPlaceElements) {
                        const retryPlaceId = extractPlaceId(retryEl.href);
                        if (retryPlaceId === expectedPlaceId) {
                            console.log(`   🔄 Retrying click for correct place...`);
                            retryEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            await sleep(500);
                            retryEl.click();
                            await sleep(2500);
                            
                            // Check if retry succeeded
                            const retryCurrentUrl = window.location.href;
                            const retryCurrentPlaceId = extractPlaceId(retryCurrentUrl);
                            
                            if (retryCurrentPlaceId === expectedPlaceId) {
                                console.log(`   ✅ Retry successful!`);
                                retrySuccess = true;
                            }
                            break;
                        }
                    }
                }
                
                if (!retrySuccess) {
                    console.error(`   ⚠️ Retry failed. Skipping this place to avoid data corruption.`);
                    continue;
                }
            }

            // Extract detailed info với retry
            console.log(`   ✓ Correct place opened. Extracting details...`);
            
            // TRY 2 TIMES only (faster)
            let detailedData = null;
            let attempts = 0;
            const maxAttempts = 2; // Reduced from 3
            
            while (!detailedData && attempts < maxAttempts) {
                attempts++;
                if (attempts > 1) {
                    console.log(`   🔄 Retry ${attempts}/${maxAttempts}...`);
                    await sleep(1000); // Reduced from 2000ms
                }
                
                detailedData = await extractDetailedData();
                
                if (detailedData && (detailedData.phone || detailedData.website)) {
                    break; // Got data!
                }
            }
            
            if (!detailedData || (!detailedData.phone && !detailedData.website)) {
                console.log(`   ⚠️ No data found`);
            }
            
            if (detailedData) {
                // CHỈ UPDATE fields mới, KHÔNG ghi đè name/address cũ
                // Vì name/address từ list thường chính xác hơn
                
                if (detailedData.phone && !allPlacesData[i].phone) {
                    allPlacesData[i].phone = detailedData.phone;
                    console.log(`   📞 Phone: ${detailedData.phone}`);
                }
                
                if (detailedData.website && !allPlacesData[i].website) {
                    allPlacesData[i].website = detailedData.website;
                    console.log(`   🌐 Website: ${detailedData.website}`);
                }
                
                if (detailedData.hours && !allPlacesData[i].hours) {
                    allPlacesData[i].hours = detailedData.hours;
                    console.log(`   🕐 Hours: ${detailedData.hours.substring(0, 30)}...`);
                }

                if (detailedData.foundedYear && !allPlacesData[i].foundedYear) {
                    allPlacesData[i].foundedYear = detailedData.foundedYear;
                    allPlacesData[i].foundedText = detailedData.foundedText;
                    console.log(`   🏗️ Founded: ${detailedData.foundedYear}`);
                }
                
                // Address chỉ update nếu detailed address dài hơn (chi tiết hơn)
                if (detailedData.address && 
                    detailedData.address.length > (allPlacesData[i].address?.length || 0)) {
                    console.log(`   📍 Better address found, updating...`);
                    allPlacesData[i].address = detailedData.address;
                }
                
                detailedCount++;
                console.log(`   ✅ Success! (${detailedCount}/${i + 1})`);
            } else {
                console.log(`   ⚠️ No details extracted`);
            }

            // Update progress
            chrome.runtime.sendMessage({
                action: 'updateProgress',
                count: i + 1
            });

            // Click back để về list
            const backButton = document.querySelector('button[aria-label*="Back"], button[aria-label*="Quay"]');
            if (backButton) {
                backButton.click();
                await sleep(500); // Reduced from 1000ms
            } else {
                // Alternative: press ESC key
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape' }));
                await sleep(500); // Reduced from 1000ms
            }

            // No extra wait needed
            await sleep(200); // Reduced from 500ms

        } catch (error) {
            console.error(`❌ Error at place ${i}:`, error);
            // Try to go back
            try {
                const backButton = document.querySelector('button[aria-label*="Back"]');
                if (backButton) backButton.click();
                await sleep(1000);
            } catch (e) {
                // Ignore
            }
        }
    }

    console.log(`\n📋 Detailed scan complete!`);
    console.log(`   Success: ${detailedCount}/${totalPlaces} places`);
    console.log(`   Rate: ${Math.round(detailedCount/totalPlaces*100)}%`);
}


// Extract thông tin chi tiết từ panel
async function extractDetailedData() {
    try {
        const data = {};

        // Quick wait for content
        await sleep(500); // Reduced from 2000ms

        // Phone search
        const phoneSelectors = [
            // Priority 1: TEL links (100% reliable when present)
            { selector: 'a[href^="tel:"]', extract: (el) => el.href.replace('tel:', '') },
            
            // Priority 2: Data-item-id with phone pattern (very reliable)
            { selector: '[data-item-id^="phone:tel:"]', extract: (el) => el.getAttribute('aria-label') || el.textContent },
            
            // Priority 3: Vietnamese aria-labels (high success in VN)
            { selector: 'button[aria-label*="Số điện thoại"]', extract: (el) => el.getAttribute('aria-label') },
            { selector: '[aria-label*="điện thoại"]', extract: (el) => el.getAttribute('aria-label') },
            
            // Priority 4: English aria-labels
            { selector: 'button[aria-label*="Phone"]', extract: (el) => el.getAttribute('aria-label') },
            { selector: 'button[aria-label*="Call"]', extract: (el) => el.getAttribute('aria-label') },
            
            // Priority 5: Common Google Maps button class (changes sometimes)
            { selector: 'button.CsEnBe[data-item-id*="phone"]', extract: (el) => el.getAttribute('aria-label') },
            
            // Priority 6: Generic patterns
            { selector: '[data-item-id*=":phone:"]', extract: (el) => el.textContent },
            { selector: '[aria-label*="phone number"]', extract: (el) => el.getAttribute('aria-label') },
        ];

        for (const {selector, extract} of phoneSelectors) {
            const elements = document.querySelectorAll(selector);
            
            for (const element of elements) {
                try {
                    const text = extract(element);
                    if (!text) continue;
                    
                    // Match phone number patterns - optimized for Vietnamese numbers
                    const phonePatterns = [
                        /(\+84[\s\-]?\d{1,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/,  // +84 format
                        /(0\d{1,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/,            // 0xxx format (VN)
                        /(\+?\d{1,3}[\s\-]?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4})/, // General
                        /(\d{10,11})/,                                       // Simple 10-11 digits
                    ];

                    for (const pattern of phonePatterns) {
                        const match = text.match(pattern);
                        if (match && match[1]) {
                            const phone = match[1].trim();
                            const digitCount = phone.replace(/\D/g, '').length;
                            
                            // Validate: 9-13 digits (reasonable phone length)
                            if (digitCount >= 9 && digitCount <= 13) {
                                if (!data.phone) {
                                    data.phone = phone;
                                    console.log(`📞 Found phone via ${selector}: ${phone}`);
                                    break;
                                }
                            }
                        }
                    }
                    if (data.phone) break;
                } catch (e) {
                    // Skip this element
                }
            }
            if (data.phone) break;
        }

        // Nếu vẫn không có, thử tìm trong toàn bộ text của panel
        if (!data.phone) {
            const panel = document.querySelector('[role="main"]') || document.querySelector('.m6QErb');
            if (panel) {
                const allText = panel.textContent;
                const phoneMatch = allText.match(/(?:Phone|Điện thoại|Tel)[:\s]+(\+?\d[\d\s\-\(\)]{8,})/i);
                if (phoneMatch && phoneMatch[1]) {
                    data.phone = phoneMatch[1].trim();
                    console.log(`📞 Found phone in panel text: ${data.phone}`);
                }
            }
        }

        // Website - Based on ACTUAL Google Maps patterns found via debug tool
        const websiteSelectors = [
            // Priority 1: Authority data-item-id (most reliable, found in 100% of cases)
            { selector: '[data-item-id="authority"]', extract: (el) => {
                if (el.href) return el.href;
                const link = el.querySelector('a');
                return link ? link.href : null;
            }},
            
            // Priority 2: Authority with nested link
            { selector: 'a[data-item-id="authority"]', extract: (el) => el.href },
            
            // Priority 3: CsEnBe class (Google Maps button class) + http
            { selector: 'a.CsEnBe[href^="http"]', extract: (el) => el.href },
            
            // Priority 4: lcr4fd class (alternative Google Maps class)
            { selector: 'a.lcr4fd[href^="http"]', extract: (el) => el.href },
            
            // Priority 5: Vietnamese aria-labels
            { selector: '[aria-label*="Trang web"]', extract: (el) => {
                if (el.href) return el.href;
                const link = el.querySelector('a');
                return link ? link.href : null;
            }},
            
            // Priority 6: English aria-labels
            { selector: '[aria-label*="Website"]', extract: (el) => {
                if (el.href) return el.href;
                const link = el.querySelector('a');
                return link ? link.href : null;
            }},
            { selector: 'a[aria-label*="website"]', extract: (el) => el.href },
            
            // Priority 7: Website data-item-id patterns
            { selector: '[data-item-id*="website"]', extract: (el) => {
                if (el.href) return el.href;
                const link = el.querySelector('a');
                return link ? link.href : null;
            }},
            { selector: '[data-item-id*=":ww:"]', extract: (el) => {
                const link = el.querySelector('a') || el;
                return link.href;
            }},
            
            // Priority 8: Generic button with website aria-label
            { selector: 'button[aria-label*="Website"]', extract: (el) => {
                const link = el.querySelector('a');
                return link ? link.href : null;
            }},
        ];

        for (const {selector, extract} of websiteSelectors) {
            try {
                const elements = document.querySelectorAll(selector);
                
                for (const element of elements) {
                    try {
                        const href = extract(element);
                        if (href && 
                            href.startsWith('http') && 
                            !href.includes('google.com') &&
                            !href.includes('gstatic.com') &&
                            !href.includes('/aclk?') && // Skip Google ad links
                            !href.includes('googleadservices.com')) {
                            data.website = href;
                            console.log(`🌐 Found website via ${selector}: ${href}`);
                            break;
                        }
                    } catch (e) {
                        // Skip this element
                    }
                }
                if (data.website) break;
            } catch (e) {
                // Skip this selector
            }
        }

        // Address (chi tiết hơn)
        const addressSelectors = [
            'button[data-item-id*="address"]',
            'button[aria-label*="Address"], button[aria-label*="Địa chỉ"]',
            'div[data-item-id*="address"]',
        ];

        for (const selector of addressSelectors) {
            const addressButton = document.querySelector(selector);
            if (addressButton) {
                const addressText = addressButton.getAttribute('aria-label') || 
                                  addressButton.getAttribute('data-tooltip') ||
                                  addressButton.textContent;
                if (addressText && addressText.length > 10) {
                    data.address = addressText
                        .replace(/^Address:\s*/i, '')
                        .replace(/^Địa chỉ:\s*/i, '')
                        .trim();
                    console.log(`📍 Found detailed address`);
                    break;
                }
            }
        }

        // Hours
        const hoursSelectors = [
            'button[data-item-id*="oh"]',
            'button[aria-label*="Hours"], button[aria-label*="Giờ"]',
            'div[data-item-id*="oh"]',
        ];

        for (const selector of hoursSelectors) {
            const hoursButton = document.querySelector(selector);
            if (hoursButton) {
                const hoursText = hoursButton.getAttribute('aria-label') || 
                                hoursButton.textContent;
                if (hoursText) {
                    data.hours = hoursText.trim();
                    console.log(`🕐 Found hours`);
                    break;
                }
            }
        }

        // Plus Code (optional)
        const plusCodeElement = document.querySelector('[data-item-id*="oloc"]');
        if (plusCodeElement) {
            data.plusCode = plusCodeElement.textContent.trim();
        }

        // Business creation date / Founded date
        const businessDateSelectors = [
            // Look for "Founded" or "Established" information
            { 
                selector: '[data-item-id*="founded"], [data-item-id*="established"]',
                extract: (el) => el.textContent || el.getAttribute('aria-label')
            },
            // Vietnamese patterns
            { 
                selector: '*',
                extract: (el) => {
                    const text = el.textContent;
                    if (text && (text.includes('Thành lập') || text.includes('Khởi nghiệp') || text.includes('Ngày thành lập'))) {
                        return text;
                    }
                    return null;
                }
            },
            // English patterns
            { 
                selector: '*',
                extract: (el) => {
                    const text = el.textContent;
                    if (text && (text.includes('Founded') || text.includes('Established') || text.includes('Since') || text.includes('Started'))) {
                        return text;
                    }
                    return null;
                }
            },
            // Look in About section
            {
                selector: '[data-section-id="about"] *, .section-about *, .business-info *',
                extract: (el) => {
                    const text = el.textContent;
                    // Look for year patterns (1900-2025)
                    const yearMatch = text.match(/(19|20)\d{2}/);
                    if (yearMatch && (text.toLowerCase().includes('found') || 
                                     text.toLowerCase().includes('establish') ||
                                     text.toLowerCase().includes('since') ||
                                     text.toLowerCase().includes('thành lập') ||
                                     text.toLowerCase().includes('khởi nghiệp'))) {
                        return text;
                    }
                    return null;
                }
            },
            // Business hours section might contain founding info
            {
                selector: '[aria-label*="business hours"], [aria-label*="giờ làm việc"]',
                extract: (el) => {
                    const text = el.textContent || el.getAttribute('aria-label');
                    if (text && ((text.includes('Since') || text.includes('Từ năm') || text.includes('Founded')))) {
                        return text;
                    }
                    return null;
                }
            }
        ];

        for (const {selector, extract} of businessDateSelectors) {
            try {
                const elements = document.querySelectorAll(selector);
                
                for (const element of elements) {
                    try {
                        const text = extract(element);
                        if (text) {
                            // Extract year from text
                            const yearPatterns = [
                                /(?:Founded|Established|Since|Thành lập|Khởi nghiệp|Từ năm)\s*:?\s*(19|20)\d{2}/i,
                                /(19|20)\d{2}/g,  // Any 4-digit year
                            ];

                            for (const pattern of yearPatterns) {
                                const match = text.match(pattern);
                                if (match) {
                                    let foundedYear = match[1] ? match[0] : match[0];
                                    
                                    // Validate year (1900-2025)
                                    const year = parseInt(foundedYear.replace(/\D/g, ''));
                                    if (year >= 1900 && year <= 2025) {
                                        data.foundedYear = year;
                                        data.foundedText = text.trim();
                                        console.log(`🏗️ Found business founded: ${year} (${text.trim()})`);
                                        break;
                                    }
                                }
                            }
                            if (data.foundedYear) break;
                        }
                    } catch (e) {
                        // Skip this element
                    }
                }
                if (data.foundedYear) break;
            } catch (e) {
                // Skip this selector
            }
        }

        // Business registration date from Google Business Profile
        // Look for "Business information" or "About this business" sections
        if (!data.foundedYear) {
            try {
                // Scroll down to try loading more business info
                const mainPanel = document.querySelector('[role="main"]');
                if (mainPanel) {
                    // Look for expandable sections that might contain business info
                    const expandButtons = mainPanel.querySelectorAll('button[aria-expanded="false"]');
                    
                    for (const button of expandButtons) {
                        const buttonText = button.textContent.toLowerCase();
                        if (buttonText.includes('about') || buttonText.includes('business') || 
                            buttonText.includes('thông tin') || buttonText.includes('giới thiệu')) {
                            
                            console.log(`🔍 Expanding section: ${button.textContent}`);
                            button.click();
                            await sleep(1000); // Wait for section to expand
                            
                            // Look for founding info in expanded section
                            const expandedContent = button.closest('div').querySelector('[data-section-id], .expanded-content, .about-section');
                            if (expandedContent) {
                                const sectionText = expandedContent.textContent;
                                const yearMatch = sectionText.match(/(?:Founded|Established|Since|Thành lập|Khởi nghiệp)\s*:?\s*(19|20)\d{2}/i);
                                if (yearMatch) {
                                    const year = parseInt(yearMatch[1] + yearMatch[0].slice(-2));
                                    if (year >= 1900 && year <= 2025) {
                                        data.foundedYear = year;
                                        data.foundedText = yearMatch[0];
                                        console.log(`🏗️ Found business founded in expanded section: ${year}`);
                                        break;
                                    }
                                }
                            }
                            break; // Only expand one section to avoid too much delay
                        }
                    }
                }
            } catch (e) {
                console.log('Error expanding business info sections:', e);
            }
        }

        return data;

    } catch (error) {
        console.error('Error extracting detailed data:', error);
        return {};
    }
}

// Extract Place ID từ URL
function extractPlaceId(url) {
    try {
        if (!url) return null;
        
        // SKIP search URLs - they don't have PlaceIDs
        if (url.includes('/search/') || url.includes('search?')) {
            return null;
        }
        
        // Format 1: /maps/place/NAME/data=...!1s0x...!8m2!3d...
        // PlaceID format: 0x[hex]:0x[hex]
        const match1 = url.match(/!1s(0x[a-f0-9]+:0x[a-f0-9]+)/i);
        if (match1 && match1[1]) {
            return match1[1];
        }

        // Format 2: Alternative data parameter format
        const match2 = url.match(/data=[^!]*!4m\d+!\w+!(0x[a-f0-9]+:0x[a-f0-9]+)/i);
        if (match2 && match2[1]) {
            return match2[1];
        }

        // Format 3: Direct in URL path
        // Only if it matches PlaceID pattern
        const match3 = url.match(/place\/([^\/\?#]+)/);
        if (match3 && match3[1]) {
            const candidate = decodeURIComponent(match3[1]);
            // Verify it's a real PlaceID (0x...:0x... format)
            if (/^0x[a-f0-9]+:0x[a-f0-9]+$/i.test(candidate)) {
                return candidate;
            }
        }

        // Format 4: Look for any 0x pattern in URL
        const match4 = url.match(/(0x[a-f0-9]+:0x[a-f0-9]+)/i);
        if (match4 && match4[1]) {
            return match4[1];
        }

        return null;
    } catch (error) {
        return null;
    }
}

// Extract coordinates từ URL
function extractCoordinates(url) {
    try {
        // Format: !3d{lat}!4d{lng}
        const latMatch = url.match(/!3d([-\d.]+)/);
        const lngMatch = url.match(/!4d([-\d.]+)/);

        if (latMatch && lngMatch) {
            return {
                lat: parseFloat(latMatch[1]),
                lng: parseFloat(lngMatch[1])
            };
        }

        // Alternative: @lat,lng,zoom
        const coordMatch = url.match(/@([-\d.]+),([-\d.]+),/);
        if (coordMatch) {
            return {
                lat: parseFloat(coordMatch[1]),
                lng: parseFloat(coordMatch[2])
            };
        }

        return null;
    } catch (error) {
        return null;
    }
}

// Lưu dữ liệu vào Chrome Storage
async function saveData() {
    try {
        // Lấy dữ liệu cũ
        const result = await chrome.storage.local.get(['scannedData']);
        const existingData = result.scannedData || [];

        // Merge với dữ liệu mới (tránh trùng lặp)
        const existingIds = new Set(existingData.map(p => p.placeId));
        const newData = allPlacesData.filter(p => !existingIds.has(p.placeId));

        const combinedData = [...existingData, ...newData];

        // Lưu lại
        await chrome.storage.local.set({ scannedData: combinedData });

        console.log(`💾 Saved ${newData.length} new places. Total: ${combinedData.length}`);

    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}

// Utility: Đợi element xuất hiện
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
}

// Utility: Sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Log khi script được inject
console.log('🗺️ Google Maps Scanner Pro - Content Script Loaded!');
