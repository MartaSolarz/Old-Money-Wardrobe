// Outfit Management Module
class OutfitManager {
    constructor(dataManager) {
        this.data = dataManager;
        this.currentColorFilter = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderOutfitWardrobe();
        this.renderCurrentOutfit();
        this.renderSavedOutfits();
    }

    setupEventListeners() {
        // Drag and drop events for outfit canvas
        const canvas = document.getElementById('outfitCanvas');
        if (canvas) {
            canvas.addEventListener('dragover', this.handleDragOver);
            canvas.addEventListener('drop', (e) => this.handleDrop(e));
            canvas.addEventListener('dragenter', this.handleDragEnter);
            canvas.addEventListener('dragleave', this.handleDragLeave);
        }
    }

    // Drag and Drop Event Handlers
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    handleDragEnter(e) {
        e.preventDefault();
        const canvas = document.getElementById('outfitCanvas');
        if (canvas) {
            canvas.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        e.preventDefault();
        // Only remove class if leaving the canvas area
        if (!e.currentTarget.contains(e.relatedTarget)) {
            const canvas = document.getElementById('outfitCanvas');
            if (canvas) {
                canvas.classList.remove('drag-over');
            }
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const canvas = document.getElementById('outfitCanvas');
        if (canvas) {
            canvas.classList.remove('drag-over');
        }

        try {
            const itemId = parseInt(e.dataTransfer.getData('text/plain'));
            const item = this.data.getItem(itemId);

            if (item) {
                const success = this.data.addToCurrentOutfit(item);
                if (success) {
                    this.renderCurrentOutfit();
                    this.showSuccess(`Dodano "${item.name}" do outfitu!`);
                } else {
                    this.showWarning(`"${item.name}" jest już w outficie!`);
                }
            }
        } catch (error) {
            console.error('Error handling drop:', error);
        }
    }

    // Outfit creation and management
    clearOutfit() {
        this.data.clearCurrentOutfit();
        this.renderCurrentOutfit();
        this.showSuccess('Outfit wyczyszczony!');
    }

    saveOutfit() {
        const currentOutfit = this.data.getCurrentOutfit();
        if (currentOutfit.length === 0) {
            this.showError('Dodaj przynajmniej jeden element do outfitu!');
            return;
        }

        const outfitName = prompt('Nazwa outfitu:', `Outfit ${this.data.getAllOutfits().length + 1}`);
        if (outfitName === null) return; // User cancelled

        try {
            const savedOutfit = this.data.saveOutfit(outfitName.trim());
            this.renderSavedOutfits();
            this.updateStats();
            this.showSuccess(`Outfit "${savedOutfit.name}" został zapisany!`);
        } catch (error) {
            this.showError('Błąd podczas zapisywania outfitu: ' + error.message);
        }
    }

    suggestOutfit() {
        try {
            const suggestedOutfit = this.data.suggestOutfit();
            this.renderCurrentOutfit();

            const itemNames = suggestedOutfit.map(item => item.name).join(', ');
            this.showSuccess(`Sugerowany outfit: ${itemNames}`);
        } catch (error) {
            this.showError(error.message);
        }
    }

    loadOutfit(outfitId) {
        const outfit = this.data.loadOutfit(outfitId);
        if (outfit) {
            this.renderCurrentOutfit();
            this.showSuccess('Outfit załadowany!');
        } else {
            this.showError('Nie można załadować outfitu!');
        }
    }

    deleteOutfit(outfitId) {
        const outfits = this.data.getAllOutfits();
        const outfit = outfits.find(o => o.id === outfitId);

        if (outfit && confirm(`Czy na pewno chcesz usunąć outfit "${outfit.name}"?`)) {
            this.data.deleteOutfit(outfitId);
            this.renderSavedOutfits();
            this.updateStats();
            this.showSuccess('Outfit został usunięty!');
        }
    }

    // Rendering methods
    renderCurrentOutfit() {
        const canvas = document.getElementById('outfitCanvas');
        if (!canvas) return;

        const currentOutfit = this.data.getCurrentOutfit();

        // Update canvas classes
        if (currentOutfit.length > 0) {
            canvas.classList.add('has-items');
        } else {
            canvas.classList.remove('has-items');
        }

        if (currentOutfit.length === 0) {
            canvas.innerHTML = `
                <div class="outfit-canvas-placeholder">
                    <p>Przeciągnij tutaj elementy z szafy aby stworzyć outfit</p>
                    <span class="drag-icon">👗✨</span>
                </div>
            `;
            return;
        }

        canvas.innerHTML = currentOutfit.map(item => `
            <div class="outfit-item" data-item-id="${item.id}">
                <div class="remove-btn" onclick="outfitManager.removeFromOutfit(${item.id})" title="Usuń z outfitu">
                    ×
                </div>
                <div class="item-image" style="background: ${item.imageData ? 'transparent' : this.data.colorMapping[item.color] || '#f5f5f5'}">
                    ${item.imageData ?
            `<img src="${item.imageData}" alt="${item.name}" loading="lazy">` :
            item.icon
        }
                </div>
                <div class="item-name">${this.escapeHtml(item.name)}</div>
                <div class="item-details">${item.category} • ${item.color}</div>
            </div>
        `).join('');
    }

    removeFromOutfit(itemId) {
        this.data.removeFromCurrentOutfit(itemId);
        this.renderCurrentOutfit();
        this.showSuccess('Element usunięty z outfitu!');
    }

    renderOutfitWardrobe() {
        const grid = document.getElementById('outfitWardrobeGrid');
        if (!grid) return;

        const categoryFilter = document.getElementById('outfitFilterCategory')?.value || '';

        const filters = {
            category: categoryFilter,
            color: this.currentColorFilter
        };

        const filteredItems = this.data.filterItems(filters);

        if (filteredItems.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👗</div>
                    <h3>Brak elementów</h3>
                    <p>Dodaj ubrania do szafy lub zmień filtr</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredItems.map(item => `
            <div class="outfit-wardrobe-item" 
                 draggable="true" 
                 data-item-id="${item.id}"
                 ondragstart="outfitManager.handleDragStart(event, ${item.id})"
                 ondragend="outfitManager.handleDragEnd(event)"
                 onclick="outfitManager.addItemToOutfit(${item.id})">
                <div class="item-image" style="background: ${item.imageData ? 'transparent' : this.data.colorMapping[item.color] || '#f5f5f5'}">
                    ${item.imageData ?
            `<img src="${item.imageData}" alt="${item.name}" loading="lazy">` :
            item.icon
        }
                </div>
                <div class="item-name">${this.escapeHtml(item.name)}</div>
                <div class="item-details">${item.category} • ${item.color}</div>
            </div>
        `).join('');
    }

    handleDragStart(event, itemId) {
        event.dataTransfer.setData('text/plain', itemId.toString());
        event.target.classList.add('dragging');

        // Optional: Set drag image
        const dragImage = event.target.cloneNode(true);
        dragImage.style.transform = 'rotate(5deg)';
        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 50, 50);

        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }

    handleDragEnd(event) {
        event.target.classList.remove('dragging');
    }

    addItemToOutfit(itemId) {
        const item = this.data.getItem(itemId);
        if (item) {
            const success = this.data.addToCurrentOutfit(item);
            if (success) {
                this.renderCurrentOutfit();
                this.showSuccess(`Dodano "${item.name}" do outfitu!`);
            } else {
                this.showWarning(`"${item.name}" jest już w outficie!`);
            }
        }
    }

    renderSavedOutfits() {
        const grid = document.getElementById('savedOutfitsGrid');
        if (!grid) return;

        const savedOutfits = this.data.getAllOutfits();

        if (savedOutfits.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💖</div>
                    <h3>Brak zapisanych outfitów</h3>
                    <p>Stwórz swój pierwszy outfit w zakładce "Twórz outfit"</p>
                </div>
            `;
            return;
        }

        // Sort by date created (newest first)
        const sortedOutfits = savedOutfits.sort((a, b) =>
            new Date(b.dateCreated) - new Date(a.dateCreated)
        );

        grid.innerHTML = sortedOutfits.map(outfit => `
            <div class="saved-outfit-card">
                <div class="saved-outfit-header">
                    <div class="saved-outfit-name">${this.escapeHtml(outfit.name)}</div>
                    <div class="saved-outfit-date">${this.formatDate(outfit.dateCreated)}</div>
                </div>
                
                <div class="saved-outfit-items">
                    ${outfit.items.map(item => `
                        <span class="saved-outfit-item-chip" style="background: ${this.data.colorMapping[item.color] || '#8b7355'}">
                            ${item.icon} ${this.escapeHtml(item.name)}
                        </span>
                    `).join('')}
                </div>
                
                <div class="saved-outfit-actions">
                    <button onclick="outfitManager.loadOutfit(${outfit.id})" class="button-edit">
                        Załaduj
                    </button>
                    <button onclick="outfitManager.deleteOutfit(${outfit.id})" class="delete-btn">
                        Usuń
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Filter methods
    filterOutfitWardrobe() {
        this.renderOutfitWardrobe();
    }

    filterByColor(color) {
        this.currentColorFilter = this.currentColorFilter === color ? '' : color;
        this.renderOutfitWardrobe();

        // Visual feedback for color filter
        const colorChips = document.querySelectorAll('.color-chip');
        colorChips.forEach(chip => {
            chip.style.transform = '';
            chip.style.boxShadow = '';
        });

        if (this.currentColorFilter) {
            const activeChip = document.querySelector(`.color-chip[style*="${this.data.colorMapping[color]}"]`);
            if (activeChip) {
                activeChip.style.transform = 'scale(1.2)';
                activeChip.style.boxShadow = '0 0 15px rgba(139, 115, 85, 0.5)';
            }
        }
    }

    clearColorFilter() {
        this.currentColorFilter = '';
        this.renderOutfitWardrobe();

        // Reset visual feedback
        const colorChips = document.querySelectorAll('.color-chip');
        colorChips.forEach(chip => {
            chip.style.transform = '';
            chip.style.boxShadow = '';
        });

        this.showSuccess('Filtr kolorów wyczyszczony!');
    }

    // Update statistics
    updateStats() {
        const totalOutfitsElement = document.getElementById('totalOutfits');
        if (totalOutfitsElement) {
            totalOutfitsElement.textContent = this.data.getAllOutfits().length;
        }
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        alert('❌ ' + message);
    }

    showSuccess(message) {
        console.log('✅ ' + message);
        // Could be enhanced with toast notifications
    }

    showWarning(message) {
        console.log('⚠️ ' + message);
        // Could be enhanced with toast notifications
    }
}

// Global functions for drag and drop (needed for HTML onclick attributes)
window.allowDrop = function(ev) {
    ev.preventDefault();
};

window.drop = function(ev) {
    if (window.outfitManager) {
        window.outfitManager.handleDrop(ev);
    }
};

// Initialize outfit manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.wardrobeData) {
        window.outfitManager = new OutfitManager(window.wardrobeData);
    }
});