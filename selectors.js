// selectors.js - Centralized CSS selectors for Google Maps

const SELECTORS = {
    // Main containers
    sidebar: '[role="feed"]',
    feed: 'div[role="feed"]',
    resultsList: 'div[role="feed"]', // Often the same as sidebar

    // Place items
    placeLink: 'a[href*="/maps/place/"]',
    placeArticle: 'div[role="article"]',
    placeOuterDiv: 'div.Nv2PK',

    // Basic Info (in list view)
    name: '.fontHeadlineSmall, .qBF1Pd',
    rating: 'span[role="img"]',
    reviews: 'span.UY7F9',
    categories: '.W4Efsd span',

    // Detailed Info (in panel)
    panel: '[role="main"], .m6QErb',
    placeTitle: 'h1',
    backButton: 'button[aria-label="Back"], button[aria-label="Quay lại"], button.hbmOfd',

    // Phone
    phone: {
        telLink: 'a[href^="tel:"]',
        dataItemId: '[data-item-id^="phone:tel:"]',
        ariaLabelVN: 'button[aria-label*="Số điện thoại"], [aria-label*="điện thoại"]',
        ariaLabelEN: 'button[aria-label*="Phone"], button[aria-label*="Call"]',
        buttonClass: 'button.CsEnBe[data-item-id*="phone"]',
        generic: '[data-item-id*=":phone:"], [aria-label*="phone number"]'
    },

    // Website
    website: {
        authority: '[data-item-id="authority"]',
        authorityLink: 'a[data-item-id="authority"]',
        buttonClass: 'a.CsEnBe[href^="http"], a.lcr4fd[href^="http"]',
        ariaLabelVN: '[aria-label*="Trang web"]',
        ariaLabelEN: '[aria-label*="Website"], a[aria-label*="website"]',
        dataItemId: '[data-item-id*="website"], [data-item-id*=":ww:"]'
    },

    // Address
    address: {
        dataItemId: 'button[data-item-id*="address"], div[data-item-id*="address"]',
        ariaLabel: 'button[aria-label*="Address"], button[aria-label*="Địa chỉ"]'
    },

    // Hours
    hours: {
        dataItemId: 'button[data-item-id*="oh"], div[data-item-id*="oh"]',
        ariaLabel: 'button[aria-label*="Hours"], button[aria-label*="Giờ"]'
    },

    // Plus Code
    plusCode: '[data-item-id*="oloc"]'
};
