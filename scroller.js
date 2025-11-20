// scroller.js - Handles scrolling logic

class AutoScroller {
    constructor(settings) {
        this.settings = settings;
        this.scrollAttempts = 0;
        this.noNewResultsCount = 0;
        this.maxNoNewResults = 5;
    }

    /**
     * Scroll the sidebar to load more results
     * @param {Element} sidebar 
     * @param {number} currentCount 
     * @returns {Promise<boolean>} true if should continue, false if should stop
     */
    async scroll(sidebar, currentCount) {
        const scrollableDiv = sidebar.querySelector(SELECTORS.feed) || sidebar;
        scrollableDiv.scrollTop = scrollableDiv.scrollHeight;

        this.scrollAttempts++;
        console.log(`📜 Scroll attempt ${this.scrollAttempts}...`);

        await Utils.sleep(this.settings.scrollDelay);

        // Check if new results loaded
        const newCount = sidebar.querySelectorAll(SELECTORS.placeLink).length;
        if (newCount === currentCount) {
            this.noNewResultsCount++;
            if (this.noNewResultsCount >= this.maxNoNewResults) {
                console.log('⚠️ No new results found after multiple scrolls. Stopping...');
                return false;
            }
        } else {
            this.noNewResultsCount = 0;
        }

        return true;
    }
}
