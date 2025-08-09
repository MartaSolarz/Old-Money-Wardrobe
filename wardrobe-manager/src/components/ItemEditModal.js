import React, { useState, useEffect } from 'react';

function ItemEditModal({ item, onClose, onSave, colors, categories, tags }) {
    const [itemName, setItemName] = useState('');
    const [itemColor, setItemColor] = useState('');
    const [itemCategory, setItemCategory] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (item) {
            setItemName(item.name || '');
            setItemColor(item.color || '');
            setItemCategory(item.category || '');
            setSelectedTags(item.tags || []);
            setNotes(item.notes || '');
        }
    }, [item]);

    const handleTagToggle = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleSave = () => {
        if (!itemName.trim() || !itemColor || !itemCategory) {
            alert('Wypełnij wszystkie wymagane pola');
            return;
        }

        const updatedItem = {
            name: itemName.trim(),
            color: itemColor,
            category: itemCategory,
            tags: selectedTags,
            notes: notes.trim(),
            updatedAt: new Date().toISOString()
        };

        onSave(updatedItem);
    };

    if (!item) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Edytuj ubranie</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {item.images && item.images.length > 0 && (
                    <div className="form-group">
                        <label className="form-label">Zdjęcia</label>
                        <div className="image-preview">
                            {item.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`${item.name} ${index + 1}`}
                                    className="preview-image"
                                />
                            ))}
                        </div>
                    </div>
                )}

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
                        Zapisz zmiany
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ItemEditModal;