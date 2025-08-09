import React, { useState } from 'react';

function AddItemModal({ onClose, onSave, colors, categories, tags }) {
    const [selectedImages, setSelectedImages] = useState([]);
    const [itemName, setItemName] = useState('');
    const [itemColor, setItemColor] = useState('');
    const [itemCategory, setItemCategory] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [notes, setNotes] = useState('');

    const handleImageSelect = async () => {
        console.log('handleImageSelect called');
        try {
            if (!window.electronAPI) {
                console.error('electronAPI not available');
                alert('Electron API nie jest dostępne. Uruchom aplikację przez Electron.');
                return;
            }

            console.log('Calling selectImages...');
            const base64Images = await window.electronAPI.selectImages();
            console.log('Received images:', base64Images);

            if (base64Images && base64Images.length > 0) {
                console.log('Setting images:', base64Images.length);
                setSelectedImages(base64Images);
            } else {
                console.log('No images selected or empty array');
            }
        } catch (error) {
            console.error('Error selecting images:', error);
            alert('Błąd przy wybieraniu zdjęć: ' + error.message);
        }
    };

    const handleTagToggle = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleSave = () => {
        if (!itemName.trim() || !itemColor || !itemCategory || selectedImages.length === 0) {
            alert('Wypełnij wszystkie wymagane pola i dodaj przynajmniej jedno zdjęcie');
            return;
        }

        const newItem = {
            name: itemName.trim(),
            color: itemColor,
            category: itemCategory,
            tags: selectedTags,
            notes: notes.trim(),
            images: selectedImages,
            createdAt: new Date().toISOString() // Automatyczna data dodania
        };

        console.log('Saving item:', newItem);
        console.log('Images count:', selectedImages.length);
        console.log('Created at:', newItem.createdAt);

        onSave([newItem]);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Dodaj nowe ubranie</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="form-group">
                    <label className="form-label">Zdjęcia *</label>
                    <div
                        className={`image-upload ${selectedImages.length > 0 ? 'has-images' : ''}`}
                        onClick={handleImageSelect}
                    >
                        {selectedImages.length === 0 ? (
                            <>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                                <div>Kliknij, aby dodać zdjęcia</div>
                                <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '8px' }}>
                                    Obsługujemy: JPG, PNG, WebP, HEIC<br/>
                                    <span style={{ color: '#27ae60', fontSize: '12px' }}>
                    ✅ Pliki HEIC automatycznie konwertowane do JPG
                  </span>
                                </div>
                            </>
                        ) : (
                            <div className="image-preview">
                                {selectedImages.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Preview ${index + 1}`}
                                        className="preview-image"
                                        onError={(e) => {
                                            console.error('Preview image failed to load:', index);
                                            e.target.style.backgroundColor = '#ff6b6b';
                                            e.target.alt = 'Błąd ładowania';
                                        }}
                                        onLoad={() => {
                                            console.log('Preview image loaded:', index);
                                        }}
                                    />
                                ))}
                                <div style={{
                                    marginTop: '12px',
                                    fontSize: '14px',
                                    color: '#27ae60',
                                    textAlign: 'center'
                                }}>
                                    ✅ Dodano {selectedImages.length} zdjęć
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Nazwa ubrania *</label>
                    <input
                        type="text"
                        className="form-input"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="np. Niebieska koszula w paski"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Kolor *</label>
                    <select
                        className="form-select"
                        value={itemColor}
                        onChange={(e) => setItemColor(e.target.value)}
                    >
                        <option value="">Wybierz kolor</option>
                        {colors.map(color => (
                            <option key={color} value={color}>{color}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Kategoria *</label>
                    <select
                        className="form-select"
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                    >
                        <option value="">Wybierz kategorię</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Tagi</label>
                    <div className="checkbox-group">
                        {tags.map(tag => (
                            <div
                                key={tag}
                                className={`checkbox-item ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                onClick={() => handleTagToggle(tag)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag)}
                                    onChange={() => {}}
                                />
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Notatki</label>
                    <textarea
                        className="form-textarea"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Dodatkowe informacje o ubraniu..."
                    />
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Anuluj
                    </button>
                    <button className="btn-save" onClick={handleSave}>
                        Zapisz
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddItemModal;