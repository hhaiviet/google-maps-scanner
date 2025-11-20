// extractor.js - Handles data extraction from DOM elements

class PlaceExtractor {
    constructor() {
        this.selectors = SELECTORS;
    }

    /**
     * Extract basic data from a place element in the list
     * @param {Element} element 
     * @returns {Object|null}
     */
    extractBasic(element) {
        try {
            const parentDiv = element.closest(this.selectors.placeArticle) || element.closest(this.selectors.placeOuterDiv);
            if (!parentDiv) return null;

            const data = {
                placeId: Utils.extractPlaceId(element.href),
                name: '',
                address: '',
                rating: null,
                reviewCount: null,
                category: '',
                url: element.href,
                phone: '',
                website: '',
                hours: '',
                latitude: null,
                longitude: null,
                timestamp: new Date().toISOString()
            };

            // Name
            const nameElement = parentDiv.querySelector(this.selectors.name);
            if (nameElement) {
                data.name = nameElement.textContent.trim();
            }

            // Rating
            const ratingElement = parentDiv.querySelector(this.selectors.rating);
            if (ratingElement) {
                const ariaLabel = ratingElement.getAttribute('aria-label') || '';
                const ratingMatch = ariaLabel.match(/([\d,\.]+)\s*(?:sao|stars?)/i);
                if (ratingMatch) {
                    data.rating = parseFloat(ratingMatch[1].replace(',', '.'));
                }
            }

            // Review Count
            const reviewElement = parentDiv.querySelector(this.selectors.reviews);
            if (reviewElement) {
                const reviewText = reviewElement.textContent;
                const reviewMatch = reviewText.match(/([\d,.]+)/);
                if (reviewMatch) {
                    data.reviewCount = parseInt(reviewMatch[1].replace(/[,\.]/g, ''));
                }
            }

            // Category and Address
            const categoryElements = parentDiv.querySelectorAll(this.selectors.categories);
            if (categoryElements.length > 1) {
                data.category = categoryElements[0].textContent.trim();
                // Address is usually the second or last element
                const addressCandidate = Array.from(categoryElements)
                    .map(el => el.textContent.trim())
                    .find(text => text.includes('·') || text.length > 20);
                if (addressCandidate) {
                    data.address = addressCandidate.replace(/^·\s*/, '');
                }
            }

            // Coordinates
            const coords = Utils.extractCoordinates(element.href);
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

    /**
     * Extract detailed data from the side panel
     * @returns {Promise<Object>}
     */
    async extractDetailed() {
        try {
            const data = {};

            // Wait for content to settle
            await Utils.sleep(300);

            // Phone Extraction
            data.phone = this._extractPhone();

            // Website Extraction
            data.website = this._extractWebsite();

            // Address Extraction
            data.address = this._extractAddress();

            // Hours Extraction
            data.hours = this._extractHours();

            // Plus Code
            const plusCodeElement = document.querySelector(this.selectors.plusCode);
            if (plusCodeElement) {
                data.plusCode = plusCodeElement.textContent.trim();
            }

            return data;

        } catch (error) {
            console.error('Error extracting detailed data:', error);
            return {};
        }
    }

    _extractPhone() {
        // 1. Try Selectors
        const phoneSelectors = [
            { selector: this.selectors.phone.telLink, extract: (el) => el.href.replace('tel:', '') },
            { selector: this.selectors.phone.dataItemId, extract: (el) => el.getAttribute('aria-label') || el.textContent },
            { selector: this.selectors.phone.ariaLabelVN, extract: (el) => el.getAttribute('aria-label') },
            { selector: this.selectors.phone.ariaLabelEN, extract: (el) => el.getAttribute('aria-label') },
            { selector: this.selectors.phone.buttonClass, extract: (el) => el.getAttribute('aria-label') },
            { selector: this.selectors.phone.generic, extract: (el) => el.textContent }
        ];

        for (const { selector, extract } of phoneSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                try {
                    const text = extract(element);
                    if (!text) continue;
                    const phone = this._parsePhoneNumber(text);
                    if (phone) return phone;
                } catch (e) { }
            }
        }

        // 2. Enhanced Search (Text Content)
        const panel = document.querySelector(this.selectors.panel) || document.body;
        if (panel) {
            const allText = panel.textContent;
            const enhancedPatterns = [
                /(?:Phone|Điện thoại|Tel|Liên hệ|Hotline)[:\s]+(\+?84[\s\-]?\d{1,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/i,
                /(?:Phone|Điện thoại|Tel|Liên hệ|Hotline)[:\s]+(0\d{1,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/i,
                /(\+84[\s\-]?\d{1,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/g,
                /(0\d{9,10})/g,
                /(\d{4}[\s\-]\d{3}[\s\-]\d{3,4})/g,
                /(\d{10,11})/g
            ];

            for (const pattern of enhancedPatterns) {
                const matches = allText.match(pattern);
                if (matches) {
                    for (const match of matches) {
                        const phone = match.replace(/^(?:Phone|Điện thoại|Tel|Liên hệ|Hotline)[:\s]+/i, '').trim();
                        if (this._isValidPhone(phone)) return phone;
                    }
                }
            }
        }

        return '';
    }

    _parsePhoneNumber(text) {
        const phonePatterns = [
            /(\+84[\s\-]?\d{1,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/,
            /(0\d{1,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/,
            /(\+?\d{1,3}[\s\-]?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4})/,
            /(\d{10,11})/
        ];

        for (const pattern of phonePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const phone = match[1].trim();
                if (this._isValidPhone(phone)) return phone;
            }
        }
        return null;
    }

    _isValidPhone(phone) {
        const digitCount = phone.replace(/\D/g, '').length;
        return digitCount >= 9 && digitCount <= 13;
    }

    _extractWebsite() {
        const websiteSelectors = [
            { selector: this.selectors.website.authority, extract: (el) => el.href || el.querySelector('a')?.href },
            { selector: this.selectors.website.authorityLink, extract: (el) => el.href },
            { selector: this.selectors.website.buttonClass, extract: (el) => el.href },
            { selector: this.selectors.website.ariaLabelVN, extract: (el) => el.href || el.querySelector('a')?.href },
            { selector: this.selectors.website.ariaLabelEN, extract: (el) => el.href || el.querySelector('a')?.href },
            { selector: this.selectors.website.dataItemId, extract: (el) => el.href || el.querySelector('a')?.href }
        ];

        for (const { selector, extract } of websiteSelectors) {
            try {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    const href = extract(element);
                    if (this._isValidWebsite(href)) return href;
                }
            } catch (e) { }
        }
        return '';
    }

    _isValidWebsite(href) {
        return href &&
            href.startsWith('http') &&
            !href.includes('google.com') &&
            !href.includes('gstatic.com') &&
            !href.includes('/aclk?') &&
            !href.includes('googleadservices.com');
    }

    _extractAddress() {
        const selectors = [
            this.selectors.address.dataItemId,
            this.selectors.address.ariaLabel
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.getAttribute('aria-label') ||
                    element.getAttribute('data-tooltip') ||
                    element.textContent;
                if (text && text.length > 10) {
                    return text
                        .replace(/^Address:\s*/i, '')
                        .replace(/^Địa chỉ:\s*/i, '')
                        .trim();
                }
            }
        }
        return '';
    }

    _extractHours() {
        const selectors = [
            this.selectors.hours.dataItemId,
            this.selectors.hours.ariaLabel
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.getAttribute('aria-label') || element.textContent;
                if (text) return text.trim();
            }
        }
        return '';
    }
}
