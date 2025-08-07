// Main Application Controller
class WardrobeApp {
    constructor() {
        this.version = '2.0';
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Failed to initialize Wardrobe App:', error);
            this.showError('Błąd inicjalizacji aplikacji');
        }
    }

    initializeApp() {
        console.log(`🎀 Old Money Wardrobe App v${this.version} - Initializing...`);

        // Initialize global functions
        this.setupGlobalFunctions();

        // Setup error handling
        this.setupErrorHandling();

        // Initialize welcome message
        this.showWelcomeMessage();

        this.initialized = true;
        console.log('✨ Wardrobe App initialized successfully!');
    }

    setupGlobalFunctions() {
        // Global functions for HTML onclick attributes
        window.addItem = async () => {
            if (window.wardrobeManager) {
                await window.wardrobeManager.addItem();
            }
        };

        window.clearOutfit = () => {
            if (window.outfitManager) {
                window.outfitManager.clearOutfit();
            }
        };

        window.saveOutfit = () => {
            if (window.outfitManager) {
                window.outfitManager.saveOutfit();
            }
        };

        window.suggestOutfit = () => {
            if (window.outfitManager) {
                window.outfitManager.suggestOutfit();
            }
        };

        window.filterWardrobe = () => {
            if (window.wardrobeManager) {
                window.wardrobeManager.filterWardrobe();
            }
        };

        window.filterOutfitWardrobe = () => {
            if (window.outfitManager) {
                window.outfitManager.filterOutfitWardrobe();
            }
        };

        window.filterByColor = (color) => {
            if (window.outfitManager) {
                window.outfitManager.filterByColor(color);
            }
        };

        window.clearColorFilter = () => {
            if (window.outfitManager) {
                window.outfitManager.clearColorFilter();
            }
        };

        window.exportData = () => {
            if (window.wardrobeManager) {
                window.wardrobeManager.exportData();
            }
        };

        window.importData = (event) => {
            if (window.wardrobeManager) {
                window.wardrobeManager.importData(event);
            }
        };

        window.closeEditModal = () => {
            if (window.wardrobeManager) {
                window.wardrobeManager.closeEditModal();
            }
        };

        window.saveEditedItem = async () => {
            if (window.wardrobeManager) {
                await window.wardrobeManager.saveEditedItem();
            }
        };

        // Keyboard shortcuts info
        window.showKeyboardShortcuts = () => {
            alert(`⌨️ Skróty klawiszowe:
            
Ctrl/Cmd + 1: Dodaj ubranie
Ctrl/Cmd + 2: Przeglądaj szafę
Ctrl/Cmd + 3: Twórz outfit
Ctrl/Cmd + 4: Zapisane outfity
Ctrl/Cmd + 5: Ustawienia

Przeciągnij elementy z szafy do obszaru outfitu, aby je dodać!`);
        };
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showError('Wystąpił nieoczekiwany błąd');
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });
    }

    showWelcomeMessage() {
        // Show welcome message for first-time users
        const hasVisited = localStorage.getItem('hasVisitedWardrobe');
        if (!hasVisited) {
            setTimeout(() => {
                this.showWelcome();
                localStorage.setItem('hasVisitedWardrobe', 'true');
            }, 1000);
        }
    }

    showWelcome() {
        const welcomeMessage = `👋 Witaj w Old Money Wardrobe!

🎯 Jak zacząć:
1. Dodaj swoje ubrania w zakładce "Dodaj ubranie"
2. Przeglądaj i organizuj w "Przeglądaj szafę"
3. Twórz stylowe outfity przeciągając elementy
4. Zapisuj ulubione kombinacje

💡 Wskazówki:
• Użyj kolorów Old Money dla eleganckich kombinacji
• Przeciągnij ubrania do obszaru outfitu
• Korzystaj ze skrótów klawiszowych (Ctrl+1-5)

Miłego komponowania! ✨`;

        if (confirm(welcomeMessage + '\n\nCzy chcesz zobaczyć skróty klawiszowe?')) {
            window.showKeyboardShortcuts();
        }
    }

    // Utility methods
    showError(message) {
        console.error(message);

        // Create toast notification (enhanced error display)
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        console.log(message);
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        // Simple toast notification system
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Set colors based on type
        switch (type) {
            case 'error':
                toast.style.background = 'linear-gradient(135deg, #c0392b, #a93226)';
                break;
            case 'success':
                toast.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
                break;
            default:
                toast.style.background = 'linear-gradient(135deg, #8b7355, #7a6449)';
        }

        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);

        // Remove on click
        toast.addEventListener('click', () => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        });
    }

    // App management methods
    getAppInfo() {
        return {
            version: this.version,
            initialized: this.initialized,
            totalItems: window.wardrobeData ? window.wardrobeData.getAllItems().length : 0,
            totalOutfits: window.wardrobeData ? window.wardrobeData.getAllOutfits().length : 0
        };
    }

    // Debug methods
    debug() {
        if (window.wardrobeData) {
            console.log('🔍 Debug Info:');
            console.log('App Info:', this.getAppInfo());
            console.log('Wardrobe Data:', window.wardrobeData.getAllItems());
            console.log('Saved Outfits:', window.wardrobeData.getAllOutfits());
            console.log('Current Outfit:', window.wardrobeData.getCurrentOutfit());
            console.log('Statistics:', window.wardrobeData.getStatistics());
        }
    }

    // Backup and restore
    async createFullBackup() {
        try {
            const data = {
                version: this.version,
                timestamp: new Date().toISOString(),
                wardrobe: window.wardrobeData.getAllItems(),
                outfits: window.wardrobeData.getAllOutfits(),
                settings: {
                    lastTab: window.tabManager ? window.tabManager.getCurrentTab() : 'add-items'
                }
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wardrobe-full-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showSuccess('Pełny backup został utworzony!');
            return true;
        } catch (error) {
            this.showError('Błąd podczas tworzenia backupu: ' + error.message);
            return false;
        }
    }

    // Performance monitoring
    getPerformanceMetrics() {
        if (performance && performance.getEntriesByType) {
            return {
                loadTime: performance.timing ? (performance.timing.loadEventEnd - performance.timing.navigationStart) : 'Unknown',
                renderTime: Date.now() - (window.appStartTime || Date.now()),
                memoryUsage: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB'
                } : 'Not available'
            };
        }
        return 'Performance API not available';
    }
}

// Dodaj te funkcje do js/main.js

// AI Provider Selection
window.selectAIProvider = function(provider) {
    // Update UI
    document.querySelectorAll('.ai-provider-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-provider="${provider}"]`).classList.add('active');

    // Show/hide API key inputs
    document.querySelectorAll('.api-key-group').forEach(group => {
        group.classList.remove('active');
    });

    if (provider === 'googleVision') {
        document.getElementById('googleVisionKey').classList.add('active');
    }

    // Update AI analyzer
    if (window.aiAnalyzer) {
        window.aiAnalyzer.setProvider(provider);
        updateAIStats();
    }

    showToast(`Wybrano dostawcę AI: ${getProviderDisplayName(provider)}`, 'success');
};

// Test AI functionality
window.testAI = async function() {
    if (!window.aiAnalyzer) {
        showToast('AI Analyzer nie jest załadowany', 'error');
        return;
    }

    // Create a test canvas with a simple pattern
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    // Draw a simple "shirt" pattern
    ctx.fillStyle = '#4169E1'; // Royal blue
    ctx.fillRect(50, 50, 100, 120); // Main body
    ctx.fillRect(20, 60, 40, 80);   // Left sleeve
    ctx.fillRect(140, 60, 40, 80);  // Right sleeve

    // Convert to blob and test
    canvas.toBlob(async (blob) => {
        try {
            const file = new File([blob], 'test-shirt.png', { type: 'image/png' });
            const result = await window.aiAnalyzer.analyzeImage(file);

            if (result) {
                showToast(`🧪 Test AI - Wykryto: ${result.category || 'nieznana kategoria'}, Kolor: ${result.color || 'nieznany'}`, 'success');
                console.log('AI Test Result:', result);
            } else {
                showToast('Test AI zakończony - brak rozpoznania', 'warning');
            }
        } catch (error) {
            showToast('Błąd testu AI: ' + error.message, 'error');
        }
    });
};

// Reset AI settings
window.resetAISettings = function() {
    if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia AI?')) {
        localStorage.removeItem('aiProvider');
        localStorage.removeItem('googleVisionApiKey');
        localStorage.removeItem('aiAnalysisCount');
        localStorage.removeItem('aiSuccessCount');

        // Reset UI
        selectAIProvider('huggingface');
        updateAIStats();

        showToast('Ustawienia AI zostały zresetowane', 'success');
    }
};

// Update AI statistics
function updateAIStats() {
    const analysisCount = parseInt(localStorage.getItem('aiAnalysisCount') || '0');
    const successCount = parseInt(localStorage.getItem('aiSuccessCount') || '0');
    const successRate = analysisCount > 0 ? Math.round((successCount / analysisCount) * 100) : 0;

    const countElement = document.getElementById('aiAnalysisCount');
    const rateElement = document.getElementById('aiSuccessRate');

    if (countElement) countElement.textContent = analysisCount;
    if (rateElement) rateElement.textContent = successRate + '%';
}

// Helper function to get provider display name
function getProviderDisplayName(provider) {
    const names = {
        'huggingface': 'Hugging Face (Darmowe)',
        'googleVision': 'Google Vision API',
        'local': 'Lokalna analiza'
    };
    return names[provider] || provider;
}

// Save API keys when they change
document.addEventListener('DOMContentLoaded', function() {
    const googleVisionKeyInput = document.getElementById('googleVisionApiKey');
    if (googleVisionKeyInput) {
        // Load saved key
        const savedKey = localStorage.getItem('googleVisionApiKey');
        if (savedKey) {
            googleVisionKeyInput.value = savedKey;
        }

        // Save key on change
        googleVisionKeyInput.addEventListener('change', function() {
            localStorage.setItem('googleVisionApiKey', this.value);
            if (window.aiAnalyzer) {
                window.aiAnalyzer.setApiKey('googleVision', this.value);
            }
            showToast('Klucz API został zapisany', 'success');
        });
    }

    // Initialize AI stats
    updateAIStats();
});

// Enhanced toast function for AI
function showToast(message, type = 'info') {
    if (window.wardrobeApp && window.wardrobeApp.showToast) {
        window.wardrobeApp.showToast(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Start the application
window.appStartTime = Date.now();
window.wardrobeApp = new WardrobeApp();

// Development helpers (available in console)
if (typeof window !== 'undefined') {
    window.app = window.wardrobeApp;
    window.debugApp = () => window.wardrobeApp.debug();
    window.appInfo = () => console.log(window.wardrobeApp.getAppInfo());
    window.performance = () => console.log(window.wardrobeApp.getPerformanceMetrics());
}

// Final initialization check
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎀 Old Money Wardrobe - Fully Loaded!');
    console.log('💡 Tip: Type debugApp() in console for debug info');
});