import React, { useState } from 'react';

function OutfitModal({ items, onClose, onSave, colors, categories, tags }) {
    const [outfitName, setOutfitName] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemFilters, setItemFilters] = useState({ color: '', category: '', tag: '' });
    const [hoveredItem, setHoveredItem] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const filteredItems = items.filter(item => {
        return (!itemFilters.color || item.color === itemFilters.color) &&
            (!itemFilters.category || item.category === itemFilters.category) &&
            (!itemFilters.tag || item.tags?.includes(itemFilters.tag));
    });

    const handleItemToggle = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleTagToggle = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleMouseEnter = (item, event) => {
        setHoveredItem(item);
        setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseMove = (event) => {
        setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    const handleSave = () => {
        if (!outfitName.trim() || selectedItems.length === 0) {
            alert('Wprowadź nazwę outfitu i wybierz przynajmniej jedno ubranie');
            return;
        }

        const newOutfit = {
            name: outfitName.trim(),
            items: selectedItems,
            tags: selectedTags,
            createdAt: new Date().toISOString() // Automatyczna data dodania
        };

        onSave(newOutfit);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%' }}>
                    <div className="modal-header">
                        <h2 className="modal-title">Stwórz nowy outfit</h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>

                    <div className="outfit-creation">
                        <div className="items-selection">
                            <h4>Wybierz ubrania</h4>

                            <div className="selection-filters">
                                <select
                                    value={itemFilters.color}
                                    onChange={(e) => setItemFilters({ ...itemFilters, color: e.target.value })}
                                >
                                    <option value="">Wszystkie kolory</option>
                                    {colors.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>

                                <select
                                    value={itemFilters.category}
                                    onChange={(e) => setItemFilters({ ...itemFilters, category: e.target.value })}
                                >
                                    <option value="">Wszystkie kategorie</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>

                                <select
                                    value={itemFilters.tag}
                                    onChange={(e) => setItemFilters({ ...itemFilters, tag: e.target.value })}
                                >
                                    <option value="">Wszystkie tagi</option>
                                    {tags.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="selectable-items">
                                {filteredItems.map(item => (
                                    <div
                                        key={item.id}
                                        className={`selectable-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                                        onClick={() => handleItemToggle(item.id)}
                                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {item.images && item.images[0] && (
                                            <img src={item.images[0]} alt={item.name} />
                                        )}
                                        <div className="selectable-item-info">
                                            {item.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="outfit-preview">
                            <h4>Wybrane ubrania</h4>

                            <div className="selected-items">
                                {selectedItems.length === 0 ? (
                                    <div className="empty-selection">
                                        Wybierz ubrania z lewej strony
                                    </div>
                                ) : (
                                    selectedItems.map(itemId => {
                                        const item = items.find(i => i.id === itemId);
                                        return item ? (
                                            <div
                                                key={itemId}
                                                className="selected-item"
                                                onMouseEnter={(e) => handleMouseEnter(item, e)}
                                                onMouseMove={handleMouseMove}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                {item.images && item.images[0] && (
                                                    <img src={item.images[0]} alt={item.name} />
                                                )}
                                                <button
                                                    className="selected-item-remove"
                                                    onClick={() => handleItemToggle(itemId)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : null;
                                    })
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nazwa outfitu *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={outfitName}
                                    onChange={(e) => setOutfitName(e.target.value)}
                                    placeholder="np. Casual piątek"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tagi outfitu</label>
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
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button className="btn-cancel" onClick={onClose}>
                            Anuluj
                        </button>
                        <button className="btn-save" onClick={handleSave}>
                            Zapisz outfit
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Tooltip */}
            {hoveredItem && hoveredItem.images && hoveredItem.images[0] && (
                <div
                    style={{
                        position: 'fixed',
                        left: mousePosition.x + 15,
                        top: mousePosition.y - 100,
                        zIndex: 2000,
                        pointerEvents: 'none',
                        background: 'white',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        padding: '8px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        maxWidth: '250px'
                    }}
                >
                    <img
                        src={hoveredItem.images[0]}
                        alt={hoveredItem.name}
                        style={{
                            width: '200px',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            display: 'block'
                        }}
                    />
                    <div style={{
                        marginTop: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#2c3e50',
                        textAlign: 'center'
                    }}>
                        {hoveredItem.name}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#7f8c8d',
                        textAlign: 'center',
                        marginTop: '4px'
                    }}>
                        {hoveredItem.color} • {hoveredItem.category}
                    </div>
                    {hoveredItem.images.length > 1 && (
                        <div style={{
                            fontSize: '11px',
                            color: '#667eea',
                            textAlign: 'center',
                            marginTop: '4px',
                            fontWeight: '500'
                        }}>
                            +{hoveredItem.images.length - 1} więcej zdjęć
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default OutfitModal;