// Wardrobe Management Module
class WardrobeManager {
    constructor(dataManager) {
        this.data = dataManager;
        this.editingItemId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderWardrobe();
        this.updateStats();
    }

    setupEventListeners() {
        // Image preview for adding items
        const itemImageInput = document.getElementById('itemImage');
        if (itemImageInput) {
            itemImageInput.addEventListener('change', (e) => this.handleImagePreview(e, 'imagePreview', 'previewImg'));
        }

        // Image preview for editing items
        const editImageInput = document.getElementById('editItemImage');
        if (editImageInput) {
            editImageInput.addEventListener('change', (e) => this.handleImagePreview(e, 'editImagePreview', 'editPreviewImg'));
        }

        // Modal close events
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('editModal');
            if (event.target === modal) {
                this.closeEditModal();
            }
        });
    }

    // Add new item to wardrobe
    async addItem() {
        const name = document.getElementById('itemName').value.trim();
        const category = document.getElementById('itemCategory').value;
        const color = document.getElementById('itemColor').value;
        const notes = document.getElementById('itemNotes').value.trim();
        const imageFile = document.getElementById('itemImage').files[0];

        // Validation
        if (!name) {
            this.showError('Podaj nazwę ubrania!');
            return;
        }

        if (!category) {
            this.showError('Wybierz kategorię!');
            return;
        }

        if (!color) {
            this.showError('Wybierz kolor!');
            return;
        }

        try {
            const itemData = {
                name,
                category,
                color,
                notes,
                imageFile
            };

            const newItem = await this.data.addItem(itemData);

            this.clearForm();
            this.renderWardrobe();
            this.updateStats();

            if (newItem.imageData) {
                this.showFileInstructions(newItem);
            }

            this.showSuccess('Ubranie zostało dodane do szafy!');

        } catch (error) {
            this.showError('Błąd podczas dodawania ubrania: ' + error.message);
        }
    }

    // Edit existing item
    editItem(itemId) {
        const item = this.data.getItem(itemId);
        if (!item) return;

        this.editingItemId = itemId;

        // Populate edit form
        document.getElementById('editItemName').value = item.name;
        document.getElementById('editItemCategory').value = item.category;
        document.getElementById('editItemColor').value = item.color;
        document.getElementById('editItemNotes').value = item.notes || '';

        // Handle image preview
        const editPreview = document.getElementById('editImagePreview');
        const editPreviewImg = document.getElementById('editPreviewImg');

        if (item.imageData) {
            editPreviewImg.src = item.imageData;
            editPreview.style.display = 'block';
        } else {
            editPreview.style.display = 'none';
        }

        // Show modal
        document.getElementById('editModal').style.display = 'block';
    }

    // Save edited item
    async saveEditedItem() {
        if (!this.editingItemId) return;

        const name = document.getElementById('editItemName').value.trim();
        const category = document.getElementById('editItemCategory').value;
        const color = document.getElementById('editItemColor').value;
        const notes = document.getElementById('editItemNotes').value.trim();
        const imageFile = document.getElementById('editItemImage').files[0];

        // Validation
        if (!name || !category || !color) {
            this.showError('Wypełnij wszystkie wymagane pola!');
            return;
        }

        try {
            const itemData = {
                name,
                category,
                color,
                notes,
                imageFile
            };

            const updatedItem = await this.data.updateItem(this.editingItemId, itemData);

            this.closeEditModal();
            this.renderWardrobe();
            this.updateStats();

            if (updatedItem && updatedItem.imageData && imageFile) {
                this.showFileInstructions(updatedItem);
            }

            this.showSuccess('Ubranie zostało zaktualizowane!');

        } catch (error) {
            this.showError('Błąd podczas edycji ubrania: ' + error.message);
        }
    }

    // Delete item
    deleteItem(itemId) {
        const item = this.data.getItem(itemId);
        if (!item) return;

        if (confirm(`Czy na pewno chcesz usunąć "${item.name}"?`)) {
            this.data.deleteItem(itemId);
            this.renderWardrobe();
            this.updateStats();
            this.showSuccess('Ubranie zostało usunięte!');
        }
    }

    // Close edit modal
    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        this.editingItemId = null;
        document.getElementById('editItemImage').value = '';
        document.getElementById('editImagePreview').style.display = 'none';
    }

    // Clear add item form
    clearForm() {
        document.getElementById('itemName').value = '';
        document.getElementById('itemCategory').value = '';
        document.getElementById('itemColor').value = '';
        document.getElementById('itemNotes').value = '';
        document.getElementById('itemImage').value = '';
        document.getElementById('imagePreview').style.display = 'none';
    }

    // Filter wardrobe items
    filterWardrobe() {
        const categoryFilter = document.getElementById('filterCategory')?.value || '';
        const colorFilter = document.getElementById('filterColor')?.value || '';
        const searchFilter = document.getElementById('searchItems')?.value || '';

        const filters = {
            category: categoryFilter,
            color: colorFilter,
            search: searchFilter
        };

        this.renderWardrobe(filters);
    }

    // Render wardrobe grid
    renderWardrobe(filters = {}) {
        const grid = document.getElementById('wardrobeGrid');
        if (!grid) return;

        const filteredItems = this.data.filterItems(filters);

        // Update count
        const countElement = document.getElementById('wardrobeCount');
        if (countElement) {
            const total = this.data.getAllItems().length;
            const filtered = filteredItems.length;
            countElement.textContent = filtered === total ?
                `${total} elementów` :
                `${filtered} z ${total} elementów`;
        }

        if (filteredItems.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👗</div>
                    <h3>Brak elementów</h3>
                    <p>${filters.search || filters.category || filters.color ?
                'Nie znaleziono elementów pasujących do filtra' :
                'Dodaj swoje pierwsze ubranie do szafy!'}</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredItems.map(item => `
            <div class="wardrobe-item" data-item-id="${item.id}">
                <div class="item-controls">
                    <button onclick="wardrobeManager.editItem(${item.id})" class="button-edit" title="Edytuj">
                        ✏️
                    </button>
                    <button onclick="wardrobeManager.deleteItem(${item.id})" class="delete-btn" title="Usuń">
                        🗑️
                    </button>
                </div>
                <div class="item-image" style="background: ${item.imageData ? 'transparent' : this.data.colorMapping[item.color] || '#f5f5f5'}">
                    ${item.imageData ?
            `<img src="${item.imageData}" alt="${item.name}" loading="lazy">` :
            item.icon
        }
                </div>
                <div class="item-name">${this.escapeHtml(item.name)}</div>
                <div class="item-details">${item.category} • ${item.color}</div>
                ${item.usageCount ? `<div class="usage-count">Użyte ${item.usageCount} razy</div>` : ''}
                ${item.notes ? `<div class="item-notes">${this.escapeHtml(item.notes)}</div>` : ''}
            </div>
        `).join('');
    }

    // Handle image preview
    handleImagePreview(event, previewContainerId, previewImgId) {
        const file = event.target.files[0];
        const preview = document.getElementById(previewContainerId);
        const previewImg = document.getElementById(previewImgId);

        if (!preview || !previewImg) return;

        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showError('Plik jest zbyt duży. Maksymalny rozmiar to 5MB.');
                event.target.value = '';
                preview.style.display = 'none';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showError('Proszę wybrać plik obrazu.');
                event.target.value = '';
                preview.style.display = 'none';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
        }
    }

    // Update statistics
    updateStats() {
        const stats = this.data.getStatistics();

        const totalItemsElement = document.getElementById('totalItems');
        if (totalItemsElement) {
            totalItemsElement.textContent = stats.totalItems;
        }

        const mostUsedColorElement = document.getElementById('mostUsedColor');
        if (mostUsedColorElement) {
            mostUsedColorElement.textContent = stats.mostUsedColor;
        }

        const mostUsedCategoryElement = document.getElementById('mostUsedCategory');
        if (mostUsedCategoryElement) {
            mostUsedCategoryElement.textContent = stats.mostUsedCategory;
        }
    }

    // Show file instructions
    showFileInstructions(item) {
        if (item.imageData && item.imagePath) {
            console.log(`💡 Zapisz zdjęcie jako: ${item.imagePath}`);
            console.log('📁 W prawdziwej aplikacji desktopowej zdjęcie zostałoby automatycznie zapisane w folderze images/');
        }
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        // Simple error display - could be enhanced with toast notifications
        alert('❌ ' + message);
    }

    showSuccess(message) {
        // Simple success display - could be enhanced with toast notifications
        console.log('✅ ' + message);
    }

    // Export/Import functionality
    exportData() {
        try {
            this.data.exportData();
            this.showSuccess('Dane wyeksportowane pomyślnie!');
        } catch (error) {
            this.showError('Błąd podczas eksportowania danych: ' + error.message);
        }
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (confirm('Czy chcesz zastąpić obecne dane importowanymi? Ta operacja nie może zostać cofnięta.')) {
                    this.data.importData(e.target.result);
                    this.renderWardrobe();
                    this.updateStats();
                    this.showSuccess('Dane zaimportowane pomyślnie!');

                    // Refresh other views if they exist
                    if (window.outfitManager) {
                        window.outfitManager.renderOutfitWardrobe();
                        window.outfitManager.renderSavedOutfits();
                    }
                }
            } catch (error) {
                this.showError('Błąd podczas importowania: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize wardrobe manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.wardrobeManager = new WardrobeManager(window.wardrobeData);
});