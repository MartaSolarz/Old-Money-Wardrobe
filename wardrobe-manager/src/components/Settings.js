import React, { useState } from 'react';

function Settings({
                      colors,
                      categories,
                      tags,
                      onColorsChange,
                      onCategoriesChange,
                      onTagsChange,
                      onExport,
                      onImport
                  }) {
    const [newColor, setNewColor] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newTag, setNewTag] = useState('');

    const handleAddColor = () => {
        if (newColor.trim() && !colors.includes(newColor.trim())) {
            onColorsChange([...colors, newColor.trim()]);
            setNewColor('');
        }
    };

    const handleRemoveColor = (colorToRemove) => {
        onColorsChange(colors.filter(color => color !== colorToRemove));
    };

    const handleAddCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            onCategoriesChange([...categories, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (categoryToRemove) => {
        onCategoriesChange(categories.filter(category => category !== categoryToRemove));
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            onTagsChange([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        onTagsChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <div className="view-header">
                <h1 className="view-title">Ustawienia</h1>
            </div>

            <div className="settings-section">
                <h3>Kolory</h3>
                <div className="settings-list">
                    {colors.map(color => (
                        <div key={color} className="settings-item">
                            <span>{color}</span>
                            <button
                                className="delete-btn"
                                onClick={() => handleRemoveColor(color)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
                <div className="add-item-form">
                    <input
                        type="text"
                        className="add-item-input"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="Nowy kolor"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddColor()}
                    />
                    <button className="add-item-btn" onClick={handleAddColor}>
                        Dodaj
                    </button>
                </div>
            </div>

            <div className="settings-section">
                <h3>Kategorie</h3>
                <div className="settings-list">
                    {categories.map(category => (
                        <div key={category} className="settings-item">
                            <span>{category}</span>
                            <button
                                className="delete-btn"
                                onClick={() => handleRemoveCategory(category)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
                <div className="add-item-form">
                    <input
                        type="text"
                        className="add-item-input"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Nowa kategoria"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button className="add-item-btn" onClick={handleAddCategory}>
                        Dodaj
                    </button>
                </div>
            </div>

            <div className="settings-section">
                <h3>Tagi</h3>
                <div className="settings-list">
                    {tags.map(tag => (
                        <div key={tag} className="settings-item">
                            <span>{tag}</span>
                            <button
                                className="delete-btn"
                                onClick={() => handleRemoveTag(tag)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
                <div className="add-item-form">
                    <input
                        type="text"
                        className="add-item-input"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Nowy tag"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <button className="add-item-btn" onClick={handleAddTag}>
                        Dodaj
                    </button>
                </div>
            </div>

            <div className="settings-section">
                <h3>Zarządzanie danymi</h3>
                <p style={{ marginBottom: '16px', color: '#7f8c8d' }}>
                    Eksportuj swoje dane aby utworzyć kopię zapasową lub importuj dane z wcześniejszej kopii.
                </p>
                <div className="export-import-actions">
                    <button className="btn-export" onClick={onExport}>
                        📤 Eksportuj dane
                    </button>
                    <button className="btn-import" onClick={onImport}>
                        📥 Importuj dane
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;