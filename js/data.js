// Data Management Module
class WardrobeData {
    constructor() {
        this.wardrobe = JSON.parse(localStorage.getItem('wardrobe')) || [];
        this.savedOutfits = JSON.parse(localStorage.getItem('savedOutfits')) || [];
        this.currentOutfit = [];

        this.categoryIcons = {
            blazer: '🧥',
            bluzka: '👕',
            spodnie: '👖',
            sukienka: '👗',
            sweter: '🧶',
            buty: '👠',
            torebka: '👜',
            dodatki: '💍',
            kurtka: '🧥',
            spodnica: '👗',
            szalik: '🧣',
            pasek: '👔'
        };

        this.colorMapping = {
            navy: '#1e3a8a',
            beige: '#d4b08a',
            cream: '#f5f5dc',
            white: '#ffffff',
            black: '#000000',
            burgundy: '#8b1538',
            camel: '#c19a6b',
            grey: '#808080',
            brown: '#8b4513',
            khaki: '#9acd32'
        };
    }

    // Item management
    addItem(itemData) {
        const itemId = Date.now();
        const item = {
            id: itemId,
            ...itemData,
            icon: this.categoryIcons[itemData.category] || '👔',
            imagePath: itemData.imageFile ? this.generateImagePath(itemId, itemData.imageFile.name) : null,
            dateAdded: new Date().toISOString(),
            usageCount: 0
        };

        if (itemData.imageFile) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    item.imageData = e.target.result;
                    this.wardrobe.push(item);
                    this.saveData();
                    resolve(item);
                };
                reader.readAsDataURL(itemData.imageFile);
            });
        } else {
            this.wardrobe.push(item);
            this.saveData();
            return Promise.resolve(item);
        }
    }

    updateItem(itemId, itemData) {
        const itemIndex = this.wardrobe.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return Promise.resolve(null);

        const item = this.wardrobe[itemIndex];
        Object.assign(item, itemData, {
            icon: this.categoryIcons[itemData.category] || '👔',
            lastModified: new Date().toISOString()
        });

        if (itemData.imageFile) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    item.imageData = e.target.result;
                    item.imagePath = this.generateImagePath(item.id, itemData.imageFile.name);
                    this.saveData();
                    resolve(item);
                };
                reader.readAsDataURL(itemData.imageFile);
            });
        } else {
            this.saveData();
            return Promise.resolve(item);
        }
    }

    deleteItem(itemId) {
        this.wardrobe = this.wardrobe.filter(item => item.id !== itemId);
        this.saveData();
        return true;
    }

    getItem(itemId) {
        return this.wardrobe.find(item => item.id === itemId);
    }

    getAllItems() {
        return [...this.wardrobe];
    }

    // Outfit management
    saveOutfit(outfitName) {
        if (this.currentOutfit.length === 0) {
            throw new Error('Outfit jest pusty!');
        }

        const outfit = {
            id: Date.now(),
            name: outfitName || `Outfit ${this.savedOutfits.length + 1}`,
            items: [...this.currentOutfit],
            dateCreated: new Date().toISOString(),
            lastWorn: null
        };

        // Increase usage count for items in outfit
        this.currentOutfit.forEach(item => {
            const wardrobeItem = this.getItem(item.id);
            if (wardrobeItem) {
                wardrobeItem.usageCount = (wardrobeItem.usageCount || 0) + 1;
            }
        });

        this.savedOutfits.push(outfit);
        this.saveData();
        return outfit;
    }

    deleteOutfit(outfitId) {
        this.savedOutfits = this.savedOutfits.filter(outfit => outfit.id !== outfitId);
        this.saveData();
        return true;
    }

    loadOutfit(outfitId) {
        const outfit = this.savedOutfits.find(o => o.id === outfitId);
        if (outfit) {
            this.currentOutfit = [...outfit.items];
            return this.currentOutfit;
        }
        return null;
    }

    addToCurrentOutfit(item) {
        // Check if item already exists in outfit
        const existingIndex = this.currentOutfit.findIndex(outfitItem => outfitItem.id === item.id);
        if (existingIndex !== -1) {
            return false; // Item already in outfit
        }

        this.currentOutfit.push(item);
        return true;
    }

    removeFromCurrentOutfit(itemId) {
        this.currentOutfit = this.currentOutfit.filter(item => item.id !== itemId);
        return true;
    }

    clearCurrentOutfit() {
        this.currentOutfit = [];
        return true;
    }

    getCurrentOutfit() {
        return [...this.currentOutfit];
    }

    getAllOutfits() {
        return [...this.savedOutfits];
    }

    // Filtering and searching
    filterItems(filters = {}) {
        let filtered = [...this.wardrobe];

        if (filters.category) {
            filtered = filtered.filter(item => item.category === filters.category);
        }

        if (filters.color) {
            filtered = filtered.filter(item => item.color === filters.color);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm) ||
                item.color.toLowerCase().includes(searchTerm) ||
                (item.notes && item.notes.toLowerCase().includes(searchTerm))
            );
        }

        return filtered;
    }

    // Outfit suggestions
    suggestOutfit() {
        if (this.wardrobe.length < 2) {
            throw new Error('Potrzebujesz więcej ubrań w szafie do sugerowania outfitów!');
        }

        const complementaryColors = {
            navy: ['cream', 'white', 'beige', 'camel'],
            beige: ['navy', 'white', 'burgundy', 'brown'],
            cream: ['navy', 'camel', 'grey', 'burgundy'],
            white: ['navy', 'black', 'camel', 'burgundy'],
            black: ['white', 'cream', 'grey', 'camel'],
            burgundy: ['cream', 'beige', 'grey', 'navy'],
            camel: ['navy', 'cream', 'white', 'brown'],
            grey: ['white', 'navy', 'burgundy', 'black'],
            brown: ['beige', 'cream', 'camel', 'khaki'],
            khaki: ['white', 'cream', 'brown', 'navy']
        };

        // Get a random starting item
        const startingItem = this.wardrobe[Math.floor(Math.random() * this.wardrobe.length)];
        const suggestedOutfit = [startingItem];

        // Find complementary items
        const compatibleColors = complementaryColors[startingItem.color] || [];
        const otherItems = this.wardrobe.filter(item =>
            item.id !== startingItem.id &&
            (compatibleColors.includes(item.color) || item.color === startingItem.color)
        );

        // Add 2-4 more items randomly
        const numberOfItems = Math.min(Math.floor(Math.random() * 3) + 2, otherItems.length);

        for (let i = 0; i < numberOfItems; i++) {
            if (otherItems.length > 0) {
                const randomIndex = Math.floor(Math.random() * otherItems.length);
                const selectedItem = otherItems.splice(randomIndex, 1)[0];
                suggestedOutfit.push(selectedItem);
            }
        }

        this.currentOutfit = suggestedOutfit;
        return this.currentOutfit;
    }

    // Statistics
    getStatistics() {
        const stats = {
            totalItems: this.wardrobe.length,
            totalOutfits: this.savedOutfits.length,
            mostUsedColor: 'Brak danych',
            mostUsedCategory: 'Brak danych',
            colorDistribution: {},
            categoryDistribution: {},
            mostWornItems: []
        };

        if (this.wardrobe.length === 0) return stats;

        // Count colors and categories
        this.wardrobe.forEach(item => {
            stats.colorDistribution[item.color] = (stats.colorDistribution[item.color] || 0) + 1;
            stats.categoryDistribution[item.category] = (stats.categoryDistribution[item.category] || 0) + 1;
        });

        // Find most common color and category
        stats.mostUsedColor = Object.keys(stats.colorDistribution)
            .reduce((a, b) => stats.colorDistribution[a] > stats.colorDistribution[b] ? a : b);

        stats.mostUsedCategory = Object.keys(stats.categoryDistribution)
            .reduce((a, b) => stats.categoryDistribution[a] > stats.categoryDistribution[b] ? a : b);

        // Most worn items (by usage count)
        stats.mostWornItems = this.wardrobe
            .filter(item => item.usageCount > 0)
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 5);

        return stats;
    }

    // Data import/export
    exportData() {
        const data = {
            wardrobe: this.wardrobe,
            savedOutfits: this.savedOutfits,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wardrobe-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return true;
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            if (!data.wardrobe || !Array.isArray(data.wardrobe) ||
                !data.savedOutfits || !Array.isArray(data.savedOutfits)) {
                throw new Error('Nieprawidłowy format danych');
            }

            this.wardrobe = data.wardrobe;
            this.savedOutfits = data.savedOutfits;
            this.saveData();

            return true;
        } catch (error) {
            throw new Error('Błąd podczas importowania danych: ' + error.message);
        }
    }

    // Utility methods
    generateImagePath(itemId, originalFileName = '') {
        const extension = originalFileName.split('.').pop() || 'jpg';
        return `images/${itemId}.${extension}`;
    }

    saveData() {
        localStorage.setItem('wardrobe', JSON.stringify(this.wardrobe));
        localStorage.setItem('savedOutfits', JSON.stringify(this.savedOutfits));
    }

    clearAllData() {
        this.wardrobe = [];
        this.savedOutfits = [];
        this.currentOutfit = [];
        localStorage.removeItem('wardrobe');
        localStorage.removeItem('savedOutfits');
        return true;
    }
}

// Create global instance
window.wardrobeData = new WardrobeData();