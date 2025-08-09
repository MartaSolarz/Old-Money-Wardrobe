import React, { useState, useEffect } from 'react';

function ItemEditModal({ item, onClose, onSave, colors, categories, tags }) {
    const [itemName, setItemName] = useState('');
    const [itemColor, setItemColor] = useState('');
    const [itemCategory, setItemCategory] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState([]);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (item) {
            setItemName(item.name || '');
            setItemColor(item.color || '');
            setItemCategory(item.category || '');
            setSelectedTags(item.tags || []);
            setNotes(item.notes || '');
            setImages(item.images || []);
        }
    }, [item]);

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
                console.log('Adding images:', base64Images.length);
                setImages(prev => [...prev, ...base64Images]);
            } else {
                console.log('No images selected or empty array');
            }
        } catch (error) {
            console.error('Error selecting images:', error);
            alert('Błąd przy wybieraniu zdjęć: ' + error.message);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

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

        if (images.length === 0) {
            alert('Dodaj przynajmniej jedno zdjęcie');
            return;
        }

        const updatedItem = {
            name: itemName.trim(),
            color: itemColor,
            category: itemCategory,
            tags: selectedTags,
            notes: notes.trim(),
            images: images,
            updatedAt: new Date().toISOString()
        };

        onSave(updatedItem);
    };

    const openImageViewer = (index) => {
        setCurrentImageIndex(index);
        setShowImageViewer(true);
    };

    if (!item) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">Edytuj ubranie</h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Zdjęcia *</label>

                        {images.length > 0 && (
                            <div className="image-preview" style={{ marginBottom: '16px' }}>
                                {images.map((image, index) => (
                                    <div key={index} style={{ position: 'relative' }}>
                                        <img
                                            src={image}
                                            alt={`${item.name} ${index + 1}`}
                                            className="preview-image"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => openImageViewer(index)}
                                            onError={(e) => {
                                                console.error('Preview image failed to load:', index);
                                                e.target.style.backgroundColor = '#ff6b6b';
                                                e.target.alt = 'Błąd ładowania';
                                            }}
                                        />
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '4px',
                                                right: '4px',
                                                background: 'rgba(231, 76, 60, 0.9)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleImageSelect}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px dashed rgba(102, 126, 234, 0.3)',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontSize: '14px',
                                color: '#667eea'
                            }}
                        >
                            📷 {images.length > 0 ? 'Dodaj więcej zdjęć' : 'Dodaj zdjęcia'}
                        </button>
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
                            Zapisz zmiany
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Viewer Modal */}
            {showImageViewer && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowImageViewer(false)}
                    style={{ zIndex: 1100 }}
                >
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            marginBottom: '20px'
                        }}>
                            <h3>Zdjęcie {currentImageIndex + 1} z {images.length}</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowImageViewer(false)}
                                style={{ fontSize: '24px' }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ position: 'relative', textAlign: 'center' }}>
                            <img
                                src={images[currentImageIndex]}
                                alt={`${item.name} ${currentImageIndex + 1}`}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain',
                                    borderRadius: '8px'
                                }}
                            />

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex(prev =>
                                            prev > 0 ? prev - 1 : images.length - 1
                                        )}
                                        style={{
                                            position: 'absolute',
                                            left: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            fontSize: '18px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex(prev =>
                                            prev < images.length - 1 ? prev + 1 : 0
                                        )}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            fontSize: '18px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        →
                                    </button>
                                </>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginTop: '20px',
                                flexWrap: 'wrap',
                                justifyContent: 'center'
                            }}>
                                {images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Miniatura ${index + 1}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            objectFit: 'cover',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            border: currentImageIndex === index ? '3px solid #667eea' : '2px solid #ddd'
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default ItemEditModal;