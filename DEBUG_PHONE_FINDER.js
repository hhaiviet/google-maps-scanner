// DEBUG_PHONE_FINDER.js
// Copy và paste script này vào Console của Chrome (F12) khi đang ở Google Maps
// Để test xem có tìm được phone không

console.log('🔍 Starting Phone Number Debug Tool...');
console.log('Make sure you clicked on a place in Google Maps!');

function findPhoneNumbers() {
    console.log('\n=== PHONE NUMBER SEARCH ===\n');
    
    const results = {
        found: [],
        methods: []
    };

    // Method 1: Button với data-item-id
    console.log('Method 1: Looking for buttons with data-item-id...');
    const phoneButtons = document.querySelectorAll('button[data-item-id*="phone"]');
    console.log(`Found ${phoneButtons.length} phone buttons`);
    phoneButtons.forEach((btn, i) => {
        const ariaLabel = btn.getAttribute('aria-label');
        const text = btn.textContent;
        console.log(`  Button ${i + 1}:`, { ariaLabel, text });
        if (ariaLabel || text) {
            results.found.push(ariaLabel || text);
            results.methods.push('button[data-item-id*="phone"]');
        }
    });

    // Method 2: Links with tel:
    console.log('\nMethod 2: Looking for tel: links...');
    const telLinks = document.querySelectorAll('a[href^="tel:"]');
    console.log(`Found ${telLinks.length} tel: links`);
    telLinks.forEach((link, i) => {
        const phone = link.getAttribute('href').replace('tel:', '');
        console.log(`  Link ${i + 1}:`, phone);
        results.found.push(phone);
        results.methods.push('a[href^="tel:"]');
    });

    // Method 3: Aria labels
    console.log('\nMethod 3: Looking for aria-label with phone...');
    const phoneAriaButtons = document.querySelectorAll('button[aria-label*="Phone"], button[aria-label*="phone"], button[aria-label*="Call"]');
    console.log(`Found ${phoneAriaButtons.length} buttons with phone aria-label`);
    phoneAriaButtons.forEach((btn, i) => {
        const ariaLabel = btn.getAttribute('aria-label');
        console.log(`  Button ${i + 1}:`, ariaLabel);
        results.found.push(ariaLabel);
        results.methods.push('aria-label phone');
    });

    // Method 4: Search in main panel text
    console.log('\nMethod 4: Searching in main panel text...');
    const panel = document.querySelector('[role="main"]') || document.querySelector('.m6QErb');
    if (panel) {
        const allText = panel.textContent;
        
        // Look for common phone patterns
        const patterns = [
            /Phone[:\s]+(\+?\d[\d\s\-\(\)]{8,})/gi,
            /Tel[:\s]+(\+?\d[\d\s\-\(\)]{8,})/gi,
            /Call[:\s]+(\+?\d[\d\s\-\(\)]{8,})/gi,
            /\+?\d{1,3}[\s\-]?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}/g,
            /\d{10,11}/g
        ];

        patterns.forEach((pattern, i) => {
            const matches = allText.match(pattern);
            if (matches) {
                console.log(`  Pattern ${i + 1} matched:`, matches);
                results.found.push(...matches);
                results.methods.push(`text pattern ${i + 1}`);
            }
        });
    } else {
        console.log('  Panel not found!');
    }

    // Method 5: Common Google Maps classes
    console.log('\nMethod 5: Looking in common GM classes...');
    const commonClasses = [
        '.rogA2c button',
        '.RcCsl button',
        'button[jsaction*="phone"]',
        '[data-tooltip*="phone"]',
        '[data-tooltip*="Phone"]'
    ];

    commonClasses.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`  Found ${elements.length} elements for: ${selector}`);
            elements.forEach((el, i) => {
                const text = el.textContent || el.getAttribute('aria-label') || el.getAttribute('data-tooltip');
                if (text) {
                    console.log(`    Element ${i + 1}:`, text.substring(0, 50));
                    results.found.push(text);
                    results.methods.push(selector);
                }
            });
        }
    });

    // Method 6: All buttons on the page
    console.log('\nMethod 6: Checking ALL buttons...');
    const allButtons = document.querySelectorAll('button');
    let phoneButtonCount = 0;
    allButtons.forEach(btn => {
        const ariaLabel = btn.getAttribute('aria-label') || '';
        const text = btn.textContent || '';
        const dataId = btn.getAttribute('data-item-id') || '';
        
        // Check if contains phone-related text
        if (ariaLabel.toLowerCase().includes('phone') || 
            ariaLabel.toLowerCase().includes('call') ||
            text.toLowerCase().includes('phone') ||
            dataId.includes('phone')) {
            console.log('  Phone button found:', {
                ariaLabel: ariaLabel.substring(0, 50),
                text: text.substring(0, 50),
                dataId: dataId
            });
            phoneButtonCount++;
            results.found.push(ariaLabel || text);
            results.methods.push('all buttons scan');
        }
    });
    console.log(`  Total phone-related buttons: ${phoneButtonCount}`);

    // Summary
    console.log('\n=== SUMMARY ===\n');
    console.log(`Total items found: ${results.found.length}`);
    
    if (results.found.length > 0) {
        console.log('\n✅ PHONE NUMBERS FOUND:');
        results.found.forEach((item, i) => {
            console.log(`  ${i + 1}. ${item} (via: ${results.methods[i]})`);
        });
        
        // Try to extract clean phone numbers
        console.log('\n📞 CLEANED PHONE NUMBERS:');
        const phones = new Set();
        results.found.forEach(text => {
            const phoneMatch = text.match(/(\+?\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}/);
            if (phoneMatch) {
                phones.add(phoneMatch[0].trim());
            }
        });
        phones.forEach(phone => console.log(`  - ${phone}`));
        
    } else {
        console.log('❌ NO PHONE NUMBERS FOUND');
        console.log('\nTroubleshooting:');
        console.log('1. Make sure you clicked on a place (not just searched)');
        console.log('2. Wait for the place details panel to fully load');
        console.log('3. Some places may not have phone numbers');
        console.log('4. Try scrolling down in the place details panel');
    }

    // Return for programmatic use
    return {
        success: results.found.length > 0,
        phones: Array.from(new Set(results.found)),
        methods: results.methods
    };
}

// Run the debug
const result = findPhoneNumbers();

console.log('\n=== COPY THIS RESULT ===');
console.log(JSON.stringify(result, null, 2));

console.log('\n💡 TIP: Share this result to help fix the extension!');
