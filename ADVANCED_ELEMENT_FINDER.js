// ADVANCED_ELEMENT_FINDER.js
// Công cụ debug mạnh để tìm CHÍNH XÁC phone và website selectors
// Copy và paste vào Console (F12) khi đã click vào 1 place có phone/website

console.clear();
console.log('%c╔════════════════════════════════════════════════════════╗', 'color: blue; font-weight: bold');
console.log('%c║    ADVANCED PHONE & WEBSITE FINDER v2.0                ║', 'color: blue; font-weight: bold');
console.log('%c║    Tìm CHÍNH XÁC elements trên Google Maps             ║', 'color: blue; font-weight: bold');
console.log('%c╚════════════════════════════════════════════════════════╝', 'color: blue; font-weight: bold');

console.log('\n🔍 Starting deep scan...\n');

const results = {
    phone: {
        found: [],
        selectors: [],
        recommendations: []
    },
    website: {
        found: [],
        selectors: [],
        recommendations: []
    }
};

// ═══════════════════════════════════════════════════════════
// PART 1: PHONE HUNTING
// ═══════════════════════════════════════════════════════════

console.log('%c📞 PHONE HUNTING', 'color: green; font-size: 14px; font-weight: bold');
console.log('─────────────────────────────────────────────────────\n');

// Method 1: Tel links
console.log('Method 1: Tel Links');
const telLinks = document.querySelectorAll('a[href^="tel:"]');
console.log(`Found ${telLinks.length} tel: links`);
telLinks.forEach((link, i) => {
    const phone = link.getAttribute('href').replace('tel:', '');
    const parent = link.parentElement;
    const parentClass = parent.className;
    const parentDataId = parent.getAttribute('data-item-id');
    
    console.log(`  Link ${i + 1}:`, {
        phone,
        linkText: link.textContent.trim().substring(0, 30),
        linkClass: link.className,
        parentClass,
        parentDataId,
        selector: `a[href="tel:${phone}"]`
    });
    
    results.phone.found.push(phone);
    results.phone.selectors.push('a[href^="tel:"]');
});

// Method 2: Buttons với data-item-id
console.log('\nMethod 2: Buttons with data-item-id');
const dataItemButtons = document.querySelectorAll('[data-item-id]');
console.log(`Found ${dataItemButtons.length} elements with data-item-id`);

const phoneButtons = Array.from(dataItemButtons).filter(el => {
    const dataId = el.getAttribute('data-item-id') || '';
    return dataId.toLowerCase().includes('phone') || 
           dataId.toLowerCase().includes('tel') ||
           dataId.toLowerCase().includes('call');
});

console.log(`  ${phoneButtons.length} of them are phone-related`);
phoneButtons.forEach((btn, i) => {
    const dataId = btn.getAttribute('data-item-id');
    const ariaLabel = btn.getAttribute('aria-label');
    const text = btn.textContent.trim();
    
    console.log(`  Button ${i + 1}:`, {
        dataId,
        ariaLabel: ariaLabel?.substring(0, 50),
        text: text.substring(0, 50),
        tagName: btn.tagName,
        className: btn.className,
        selector: `[data-item-id="${dataId}"]`
    });
    
    if (ariaLabel || text) {
        // Extract phone từ text
        const phoneMatch = (ariaLabel || text).match(/(\+?\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}/);
        if (phoneMatch) {
            results.phone.found.push(phoneMatch[0]);
            results.phone.selectors.push(`[data-item-id="${dataId}"]`);
        }
    }
});

// Method 3: Aria labels
console.log('\nMethod 3: Elements with phone-related aria-labels');
const allElements = document.querySelectorAll('[aria-label]');
const phoneAriaElements = Array.from(allElements).filter(el => {
    const label = el.getAttribute('aria-label').toLowerCase();
    return label.includes('phone') || 
           label.includes('call') || 
           label.includes('tel') ||
           label.includes('điện thoại') ||
           label.includes('số điện');
});

console.log(`Found ${phoneAriaElements.length} elements with phone aria-labels`);
phoneAriaElements.forEach((el, i) => {
    const ariaLabel = el.getAttribute('aria-label');
    const dataId = el.getAttribute('data-item-id');
    
    console.log(`  Element ${i + 1}:`, {
        tagName: el.tagName,
        ariaLabel: ariaLabel.substring(0, 60),
        dataId,
        className: el.className.substring(0, 40),
        text: el.textContent.trim().substring(0, 30)
    });
    
    // Extract phone
    const phoneMatch = ariaLabel.match(/(\+?\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}/);
    if (phoneMatch) {
        results.phone.found.push(phoneMatch[0]);
        
        // Generate selector
        if (dataId) {
            results.phone.selectors.push(`[data-item-id="${dataId}"]`);
        } else if (el.className) {
            results.phone.selectors.push(`${el.tagName.toLowerCase()}.${el.className.split(' ')[0]}[aria-label*="phone"]`);
        }
    }
});

// Method 4: Scan toàn bộ DOM tree
console.log('\nMethod 4: Deep DOM scan for phone patterns');
const mainPanel = document.querySelector('[role="main"]') || document.body;

function scanElement(element, depth = 0) {
    if (depth > 5) return; // Limit depth
    
    const text = element.textContent;
    if (!text) return;
    
    // Phone patterns
    const patterns = [
        /Phone[:\s]+(\+?\d[\d\s\-\(\)]{9,})/gi,
        /Tel[:\s]+(\+?\d[\d\s\-\(\)]{9,})/gi,
        /Call[:\s]+(\+?\d[\d\s\-\(\)]{9,})/gi,
        /Điện thoại[:\s]+(\+?\d[\d\s\-\(\)]{9,})/gi,
        /(\+84[\s\-]?\d{2,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/g,
        /(0\d{2,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/g
    ];
    
    patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches && element.childElementCount < 5) { // Leaf or near-leaf nodes
            matches.forEach(match => {
                console.log(`  Found in ${element.tagName}.${element.className.split(' ')[0]}:`, match.substring(0, 40));
                results.phone.found.push(match);
            });
        }
    });
}

scanElement(mainPanel);

// ═══════════════════════════════════════════════════════════
// PART 2: WEBSITE HUNTING
// ═══════════════════════════════════════════════════════════

console.log('\n%c🌐 WEBSITE HUNTING', 'color: green; font-size: 14px; font-weight: bold');
console.log('─────────────────────────────────────────────────────\n');

// Method 1: Links với data-item-id
console.log('Method 1: Links with data-item-id');
const websiteDataItems = Array.from(dataItemButtons).filter(el => {
    const dataId = el.getAttribute('data-item-id') || '';
    return dataId.toLowerCase().includes('authority') || 
           dataId.toLowerCase().includes('website') ||
           dataId.toLowerCase().includes('url');
});

console.log(`Found ${websiteDataItems.length} website data-items`);
websiteDataItems.forEach((el, i) => {
    const dataId = el.getAttribute('data-item-id');
    const href = el.href || el.querySelector('a')?.href;
    
    console.log(`  Element ${i + 1}:`, {
        tagName: el.tagName,
        dataId,
        href,
        text: el.textContent.trim().substring(0, 40),
        selector: `[data-item-id="${dataId}"]`
    });
    
    if (href && !href.includes('google.com')) {
        results.website.found.push(href);
        results.website.selectors.push(`[data-item-id="${dataId}"]`);
    }
});

// Method 2: All external links
console.log('\nMethod 2: All external links (non-Google)');
const allLinks = document.querySelectorAll('a[href^="http"]');
const externalLinks = Array.from(allLinks).filter(link => {
    const href = link.href;
    return !href.includes('google.com') && 
           !href.includes('gstatic.com') &&
           !href.includes('tel:') &&
           !href.includes('mailto:');
});

console.log(`Found ${externalLinks.length} external links`);
externalLinks.forEach((link, i) => {
    if (i < 10) { // Show first 10 only
        const parent = link.parentElement;
        
        console.log(`  Link ${i + 1}:`, {
            href: link.href,
            text: link.textContent.trim().substring(0, 30),
            className: link.className.substring(0, 30),
            parentClass: parent.className.substring(0, 30),
            dataItemId: parent.getAttribute('data-item-id'),
            ariaLabel: link.getAttribute('aria-label')
        });
        
        results.website.found.push(link.href);
        
        // Generate selector
        const dataId = parent.getAttribute('data-item-id');
        if (dataId) {
            results.website.selectors.push(`[data-item-id="${dataId}"] a`);
        } else if (link.className) {
            results.website.selectors.push(`a.${link.className.split(' ')[0]}[href^="http"]`);
        }
    }
});

// Method 3: Aria labels for website
console.log('\nMethod 3: Website aria-labels');
const websiteAriaElements = Array.from(allElements).filter(el => {
    const label = el.getAttribute('aria-label').toLowerCase();
    return label.includes('website') || 
           label.includes('web site') ||
           label.includes('homepage') ||
           label.includes('trang web');
});

console.log(`Found ${websiteAriaElements.length} website aria-label elements`);
websiteAriaElements.forEach((el, i) => {
    const ariaLabel = el.getAttribute('aria-label');
    const href = el.href || el.querySelector('a')?.href;
    
    console.log(`  Element ${i + 1}:`, {
        tagName: el.tagName,
        ariaLabel: ariaLabel.substring(0, 50),
        href,
        className: el.className.substring(0, 40)
    });
    
    if (href && !href.includes('google.com')) {
        results.website.found.push(href);
        results.website.selectors.push(`[aria-label*="website"]`);
    }
});

// ═══════════════════════════════════════════════════════════
// PART 3: CLASS NAME ANALYSIS
// ═══════════════════════════════════════════════════════════

console.log('\n%c🔍 CLASS NAME PATTERNS', 'color: orange; font-size: 14px; font-weight: bold');
console.log('─────────────────────────────────────────────────────\n');

// Analyze common class patterns
const classMap = new Map();

[...telLinks, ...phoneButtons, ...phoneAriaElements].forEach(el => {
    const classes = el.className.split(' ').filter(c => c.length > 0);
    classes.forEach(cls => {
        classMap.set(cls, (classMap.get(cls) || 0) + 1);
    });
});

console.log('Most common classes in phone elements:');
const sortedClasses = Array.from(classMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

sortedClasses.forEach(([cls, count]) => {
    console.log(`  .${cls}: ${count} times`);
    results.phone.recommendations.push(`.${cls}`);
});

// ═══════════════════════════════════════════════════════════
// SUMMARY & RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════

console.log('\n%c═══════════════════════════════════════════════════════', 'color: blue; font-weight: bold');
console.log('%c📊 SUMMARY', 'color: blue; font-size: 16px; font-weight: bold');
console.log('%c═══════════════════════════════════════════════════════', 'color: blue; font-weight: bold');

// Phone summary
console.log('\n%c📞 PHONE RESULTS:', 'color: green; font-weight: bold');
const uniquePhones = [...new Set(results.phone.found)];
console.log(`Total found: ${uniquePhones.length}`);
uniquePhones.forEach((phone, i) => {
    console.log(`  ${i + 1}. ${phone}`);
});

// Website summary
console.log('\n%c🌐 WEBSITE RESULTS:', 'color: green; font-weight: bold');
const uniqueWebsites = [...new Set(results.website.found)];
console.log(`Total found: ${uniqueWebsites.length}`);
uniqueWebsites.forEach((site, i) => {
    console.log(`  ${i + 1}. ${site}`);
});

// Selector recommendations
console.log('\n%c✅ RECOMMENDED SELECTORS:', 'color: blue; font-weight: bold');
console.log('\n📞 For Phone:');
const uniquePhoneSelectors = [...new Set(results.phone.selectors)].slice(0, 5);
uniquePhoneSelectors.forEach((sel, i) => {
    console.log(`  ${i + 1}. ${sel}`);
});

console.log('\n🌐 For Website:');
const uniqueWebsiteSelectors = [...new Set(results.website.selectors)].slice(0, 5);
uniqueWebsiteSelectors.forEach((sel, i) => {
    console.log(`  ${i + 1}. ${sel}`);
});

// Code to add to extension
console.log('\n%c🔧 CODE TO ADD TO EXTENSION:', 'color: red; font-weight: bold');
console.log('\nCopy these selectors to content.js:\n');

console.log('%c// Phone selectors', 'color: gray');
console.log('const phoneSelectors = [');
uniquePhoneSelectors.forEach(sel => {
    console.log(`    '${sel}',`);
});
console.log('];\n');

console.log('%c// Website selectors', 'color: gray');
console.log('const websiteSelectors = [');
uniqueWebsiteSelectors.forEach(sel => {
    console.log(`    '${sel}',`);
});
console.log('];');

// Export results
console.log('\n%c📋 FULL RESULTS (Copy này để share):', 'color: blue; font-weight: bold');
console.log(JSON.stringify({
    phones: uniquePhones,
    websites: uniqueWebsites,
    phoneSelectors: uniquePhoneSelectors,
    websiteSelectors: uniqueWebsiteSelectors,
    recommendations: results.phone.recommendations.slice(0, 5)
}, null, 2));

console.log('\n%c✅ DONE! Share results above để update extension!', 'color: green; font-weight: bold');

// Return for programmatic access
({
    phones: uniquePhones,
    websites: uniqueWebsites,
    phoneSelectors: uniquePhoneSelectors,
    websiteSelectors: uniqueWebsiteSelectors
});
