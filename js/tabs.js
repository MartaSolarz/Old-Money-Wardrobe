// Tab Management Module
class TabManager {
    constructor() {
        this.activeTab = 'add-items';
        this.init();
    }

    init() {
        // Set initial active tab from URL hash or default
        const hash = window.location.hash.slice(1);
        if (hash && this.isValidTab(hash)) {
            this.activeTab = hash;
        }

        this.showTab(this.activeTab);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            const hash = window.location.hash.slice(1);
            if (hash && this.isValidTab(hash)) {
                this.showTab(hash, false);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                const num = parseInt(event.key);
                if (num >= 1 && num <= 5) {
                    event.preventDefault();
                    const tabs = ['add-items', 'browse-wardrobe', 'create-outfit', 'saved-outfits', 'settings'];
                    const targetTab = tabs[num - 1];
                    if (targetTab) {
                        this.switchTab(targetTab);
                    }
                }
            }
        });
    }

    switchTab(tabId) {
        if (!this.isValidTab(tabId)) {
            console.error('Invalid tab ID:', tabId);
            return;
        }

        this.showTab(tabId, true);
    }

    showTab(tabId, addToHistory = true) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab content
        const selectedContent = document.getElementById(tabId);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }

        // Activate corresponding tab button
        const selectedButton = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // Update URL hash
        if (addToHistory) {
            window.history.pushState(null, null, `#${tabId}`);
        }

        this.activeTab = tabId;

        // Trigger tab-specific initialization
        this.onTabChange(tabId);
    }

    onTabChange(tabId) {
        switch (tabId) {
            case 'browse-wardrobe':
                if (window.wardrobeManager) {
                    window.wardrobeManager.renderWardrobe();
                    window.wardrobeManager.updateStats();
                }
                break;

            case 'create-outfit':
                if (window.outfitManager) {
                    window.outfitManager.renderOutfitWardrobe();
                    window.outfitManager.renderCurrentOutfit();
                }
                break;

            case 'saved-outfits':
                if (window.outfitManager) {
                    window.outfitManager.renderSavedOutfits();
                }
                break;

            case 'settings':
                if (window.wardrobeManager) {
                    window.wardrobeManager.updateStats();
                }
                if (window.outfitManager) {
                    window.outfitManager.updateStats();
                }
                break;
        }

        // Add subtle animation feedback
        this.addTabChangeAnimation();
    }

    addTabChangeAnimation() {
        const activeContent = document.querySelector('.tab-content.active');
        if (activeContent) {
            activeContent.style.opacity = '0';
            activeContent.style.transform = 'translateY(10px)';

            setTimeout(() => {
                activeContent.style.opacity = '1';
                activeContent.style.transform = 'translateY(0)';
            }, 50);
        }
    }

    isValidTab(tabId) {
        const validTabs = ['add-items', 'browse-wardrobe', 'create-outfit', 'saved-outfits', 'settings'];
        return validTabs.includes(tabId);
    }

    getCurrentTab() {
        return this.activeTab;
    }

    // Method to programmatically navigate to specific sections
    navigateToAddItems() {
        this.switchTab('add-items');
    }

    navigateToBrowse() {
        this.switchTab('browse-wardrobe');
    }

    navigateToOutfitCreator() {
        this.switchTab('create-outfit');
    }

    navigateToSavedOutfits() {
        this.switchTab('saved-outfits');
    }

    navigateToSettings() {
        this.switchTab('settings');
    }
}

// Global function for tab switching (needed for HTML onclick)
window.switchTab = function(tabId) {
    if (window.tabManager) {
        window.tabManager.switchTab(tabId);
    }
};

// Initialize tab manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.tabManager = new TabManager();
});