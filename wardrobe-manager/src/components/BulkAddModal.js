import React, { useState } from 'react';

function BulkAddModal({ onClose, onSave, colors, categories, tags }) {
    const [selectedImages, setSelectedImages] = useState([]);
    const [itemsData, setItemsData] = useState([]);

    const handleImageSelect = async () => {
        console.log('handleImageSelect called for bulk add');
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

                // Stwórz obiekt dla każdego zdjęcia z domyślnymi wartościami
                const newItemsData = base64Images.map((image, index) => ({
                    id: `temp_${Date.now()}_${index}`,
                    image: image,
                    name: '',
                    color: '',
                    category: '',
                    tags: [],
                    notes: ''
                }));

                setItemsData(newItemsData);
            } else {
                console.log('No images selected or empty array');
            }
        } catch (error) {
            console.error('Error selecting images:', error);
            alert('Błąd przy wybieraniu zdjęć: ' + error.message);
        }
    };

    const updateItemData = (itemId, field, value) => {
        setItemsData(prev => prev.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        ));
    };

    const handleTagToggle = (itemId, tag) => {
        setItemsData(prev => prev.map(item => {
            if (item.id === itemId) {
                const currentTags = item.tags || [];
                const newTags = currentTags.includes(tag)
                    ? currentTags.filter(t => t !== tag)
                    : [...currentTags, tag];
                return { ...item, tags: newTags };
            }
            return item;
        }));
    };

    const handleSave = () => {
        // Sprawdź czy wszystkie obowiązkowe pola są wypełnione
        const incompleteItems = itemsData.filter(item =>
            !item.name.trim() || !item.color || !item.category
        );

        if (incompleteItems.length > 0) {
            alert(`Wypełnij wszystkie obowiązkowe pola (nazwa, kolor, kategoria) dla wszystkich ${itemsData.length} ubrań.`);
            return;
        }

        // Przekształć dane do formatu oczekiwanego przez aplikację
        const newItems = itemsData.map(item => ({
            name: item.name.trim(),
            color: item.color,
            category: item.category,
            tags: item.tags || [],
            notes: item.notes.trim(),
            images: [item.image], // Każdy item ma jedno zdjęcie
            createdAt: new Date().toISOString()
        }));

        console.log('Saving bulk items:', newItems);
        onSave(newItems);
        onClose();
    };

    const handleRemoveItem = (itemId) => {
        setItemsData(prev => prev.filter(item => item.id !== itemId));
        // Usuń również odpowiednie zdjęcie
        const itemIndex = itemsData.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            setSelectedImages(prev => prev.filter((_, index) => index !== itemIndex));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '95vw',
                    width: '1200px',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div className="modal-header">
                    <h2 className="modal-title">Dodaj wiele ubrań naraz</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {selectedImages.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div
                            className="image-upload"
                            onClick={handleImageSelect}
                            style={{
                                border: '2px dashed rgba(102, 126, 234, 0.3)',
                                borderRadius: '12px',
                                padding: '60px 40px',
                                cursor: 'pointer',
                                background: 'rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📷</div>
                            <div style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>
                                Wybierz zdjęcia ubrań
                            </div>
                            <div style={{ fontSize: '16px', color: '#7f8c8d', marginBottom: '16px' }}>
                                Jedno zdjęcie = jedno ubranie
                            </div>
                            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                                Obsługujemy: JPG, PNG, WebP, HEIC<br/>
                                <span style={{ color: '#27ae60', fontSize: '12px' }}>
                                    ✅ Pliki HEIC automatycznie konwertowane do JPG
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: '20px'
                    }}>
                        <div style={{
                            marginBottom: '20px',
                            padding: '16px',
                            background: 'rgba(102, 126, 234, 0.1)',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <strong>Dodawanie {itemsData.length} ubrań</strong>
                            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                                Wypełnij obowiązkowe pola dla każdego ubrania
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gap: '20px',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
                        }}>
                            {itemsData.map((item, index) => (
                                <div
                                    key={item.id}
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        background: 'white'
                                    }}
                                >
                                    {/* Nagłówek z numerem i przyciskiem usuń */}
                                    <div style={{
                                        background: 'rgba(102, 126, 234, 0.1)',
                                        padding: '12px 16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <strong>Ubranie {index + 1}</strong>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            style={{
                                                background: 'rgba(231, 76, 60, 0.1)',
                                                border: '1px solid rgba(231, 76, 60, 0.3)',
                                                borderRadius: '4px',
                                                color: '#e74c3c',
                                                cursor: 'pointer',
                                                padding: '4px 8px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Usuń
                                        </button>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        height: '280px'
                                    }}>
                                        {/* Zdjęcie po lewej */}
                                        <div style={{
                                            width: '140px',
                                            flexShrink: 0
                                        }}>
                                            <img
                                                src={item.image}
                                                alt={`Ubranie ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    console.error('Preview image failed to load:', index);
                                                    e.target.style.backgroundColor = '#ff6b6b';
                                                    e.target.alt = 'Błąd ładowania';
                                                }}
                                            />
                                        </div>

                                        {/* Formularz po prawej */}
                                        <div style={{
                                            flex: 1,
                                            padding: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px'
                                        }}>
                                            {/* Nazwa - obowiązkowe */}
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '4px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#2c3e50'
                                                }}>
                                                    Nazwa *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => updateItemData(item.id, 'name', e.target.value)}
                                                    placeholder="np. Niebieska koszula"
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 10px',
                                                        border: '1px solid rgba(0,0,0,0.1)',
                                                        borderRadius: '6px',
                                                        fontSize: '13px'
                                                    }}
                                                />
                                            </div>

                                            {/* Kolor - obowiązkowe */}
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '4px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#2c3e50'
                                                }}>
                                                    Kolor *
                                                </label>
                                                <select
                                                    value={item.color}
                                                    onChange={(e) => updateItemData(item.id, 'color', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 10px',
                                                        border: '1px solid rgba(0,0,0,0.1)',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        background: 'white'
                                                    }}
                                                >
                                                    <option value="">Wybierz kolor</option>
                                                    {colors.map(color => (
                                                        <option key={color} value={color}>{color}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Kategoria - obowiązkowe */}
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '4px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#2c3e50'
                                                }}>
                                                    Kategoria *
                                                </label>
                                                <select
                                                    value={item.category}
                                                    onChange={(e) => updateItemData(item.id, 'category', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 10px',
                                                        border: '1px solid rgba(0,0,0,0.1)',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        background: 'white'
                                                    }}
                                                >
                                                    <option value="">Wybierz kategorię</option>
                                                    {categories.map(category => (
                                                        <option key={category} value={category}>{category}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Tagi - opcjonalne */}
                                            <div style={{ flex: 1 }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '4px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#2c3e50'
                                                }}>
                                                    Tagi (opcjonalne)
                                                </label>
                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: '4px'
                                                }}>
                                                    {tags.map(tag => (
                                                        <div
                                                            key={tag}
                                                            onClick={() => handleTagToggle(item.id, tag)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                fontSize: '11px',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                border: '1px solid rgba(0,0,0,0.1)',
                                                                background: (item.tags || []).includes(tag)
                                                                    ? 'rgba(102, 126, 234, 0.2)'
                                                                    : 'rgba(255, 255, 255, 0.8)',
                                                                color: (item.tags || []).includes(tag)
                                                                    ? '#667eea'
                                                                    : '#666'
                                                            }}
                                                        >
                                                            {tag}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="modal-actions" style={{
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    padding: '20px'
                }}>
                    {selectedImages.length > 0 && (
                        <button
                            onClick={handleImageSelect}
                            style={{
                                marginRight: 'auto',
                                padding: '12px 20px',
                                background: 'rgba(102, 126, 234, 0.1)',
                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                borderRadius: '8px',
                                color: '#667eea',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            📷 Dodaj więcej zdjęć
                        </button>
                    )}

                    <button className="btn-cancel" onClick={onClose}>
                        Anuluj
                    </button>

                    {selectedImages.length > 0 && (
                        <button className="btn-save" onClick={handleSave}>
                            Zapisz wszystkie ({itemsData.length})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BulkAddModal;