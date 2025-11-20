// utils.js - Helper functions

const Utils = {
    /**
     * Sleep for a specified amount of time
     * @param {number} ms 
     * @returns {Promise}
     */
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    /**
     * Wait for an element to appear in the DOM
     * @param {string} selector 
     * @param {number} timeout 
     * @returns {Promise<Element|null>}
     */
    waitForElement: async (selector, timeout = 10000) => {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) return element;
            await Utils.sleep(500);
        }
        return null;
    },

    /**
     * Extract Place ID from URL
     * @param {string} url 
     * @returns {string|null}
     */
    extractPlaceId: (url) => {
        try {
            const match = url.match(/\/maps\/place\/([^\/]+)\//);
            return match ? match[1] : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Extract coordinates from URL
     * @param {string} url 
     * @returns {Object|null} {lat, lng}
     */
    extractCoordinates: (url) => {
        try {
            const match = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
            if (match) {
                return {
                    lat: parseFloat(match[1]),
                    lng: parseFloat(match[2])
                };
            }
            return null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Calculate string similarity (Levenshtein distance based)
     * @param {string} str1 
     * @param {string} str2 
     * @returns {number} 0 to 1
     */
    calculateStringSimilarity: (str1, str2) => {
        const len1 = str1.length;
        const len2 = str2.length;
        const maxLen = Math.max(len1, len2);
        if (maxLen === 0) return 1.0;

        const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        return 1.0 - (matrix[len1][len2] / maxLen);
    }
};
