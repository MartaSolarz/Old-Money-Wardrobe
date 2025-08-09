import React, { useState, useMemo } from 'react';

function OutfitsView({
                         outfits,
                         items,
                         filters,
                         onFiltersChange,
                         onDeleteOutfit,
                         onEditOutfit,
                         tags,
                         colors,
                         categories
                     }) {
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [viewerItem, setViewerItem] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const getItemById = (id) => items.find(item => item.id === id);

    const formatDate = (dateString) => {
        if (!dateString) return 'Brak daty';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return 'Nieprawidłowa data';
        }
    };

    const filterByDateRange = (outfit) => {
        if (!filters.dateFrom && !filters.dateTo) return true;

        const outfitDate = new Date(outfit.createdAt || outfit.updatedAt || '2000-01-01');
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : new Date('2000-01-01');
        const toDate = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59') : new Date('2100-12-31');

        return outfitDate >= fromDate && outfitDate <= toDate;
    };

    const openImageViewer = (item, imageIndex = 0) => {
        setViewerItem(item);
        setCurrentImageIndex(imageIndex);
        setShowImageViewer(true);
    };

    const handleItemImageClick = (item, e) => {
        e.stopPropagation();
        openImageViewer(item, 0);
    };

    const handleColorChange = (color, checked) => {
        const newColors = checked
            ? [...(filters.colors || []), color]
            : (filters.colors || []).filter(c => c !== color);
        onFiltersChange({ ...filters, colors: newColors });
    };

    const handleTagChange = (tag, checked) => {
        const newTags = checked
            ? [...(filters.tags || []), tag]
            : (filters.tags || []).filter(t => t !== tag);
        onFiltersChange({ ...filters, tags: newTags });
    };

    // Filtrowanie i sortowanie outfitów
    const filteredAndSortedOutfits = useMemo(() => {
        // Najpierw filtrujemy
        let filtered = outfits.filter(outfit => {
            // Filtr tekstowy
            const matchesSearch = !filters.search ||
                outfit.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                outfit.items.some(itemId => {
                    const item = items.find(i => i.id === itemId);
                    return item?.name.toLowerCase().includes(filters.search.toLowerCase());
                });

            // Filtr tagów outfitu (dotyczy tagów samego outfitu)
            const matchesOutfitTags = !filters.tags?.length ||
                filters.tags.some(tag => outfit.tags?.includes(tag));

            // Filtr kolorów - sprawdza czy outfit zawiera ubranie w wybranym kolorze
            const matchesColors = !filters.colors?.length ||
                filters.colors.some(selectedColor => {
                    return outfit.items.some(itemId => {
                        const item = getItemById(itemId);
                        return item?.color === selectedColor;
                    });
                });

            // Filtr daty
            const matchesDate = filterByDateRange(outfit);

            return matchesSearch && matchesOutfitTags && matchesColors && matchesDate;
        });

        // Potem sortujemy
        return filtered.sort((a, b) => {
            const sortBy = filters.sortBy || 'date_desc';

            switch (sortBy) {
                case 'date_asc':
                    const dateA = new Date(a.createdAt || '2000-01-01');
                    const dateB = new Date(b.createdAt || '2000-01-01');
                    return dateA - dateB;

                case 'date_desc':
                    const dateA2 = new Date(a.createdAt || '2000-01-01');
                    const dateB2 = new Date(b.createdAt || '2000-01-01');
                    return dateB2 - dateA2;

                case 'name_asc':
                    return a.name.localeCompare(b.name, 'pl');

                case 'name_desc':
                    return b.name.localeCompare(a.name, 'pl');

                default:
                    // Domyślnie sortuj po dacie (najnowsze pierwsze)
                    const dateA3 = new Date(a.createdAt || '2000-01-01');
                    const dateB3 = new Date(b.createdAt || '2000-01-01');
                    return dateB3 - dateA3;
            }
        });
    }, [outfits, filters, items]);

    return (
        <>
            <div>
                <div className="view-header">
                    <h1 className="view-title">Twoje outfity</h1>
                    <div className="view-stats">
                        {filteredAndSortedOutfits.length} z {outfits.length} outfitów
                    </div>
                </div>

                <div className="filters" style={{ marginBottom: '30px' }}>
                    <input
                        type="text"
                        placeholder="Szukaj outfitów lub ubrań..."
                        className="filter-input"
                        value={filters.search || ''}
                        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                        style={{
                            width: '100%',
                            marginBottom: '20px',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                    />

                    <div className="filter-sections" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '20px',
                        alignItems: 'flex-start'
                    }}>

                        {/* Filtr dat */}
                        <div className="filter-section" style={{
                            minWidth: '250px',
                            flex: '1 1 250px'
                        }}>
                            {/* Sortowanie */}
                            <div className="filter-section" style={{
                                minWidth: '200px',
                                flex: '1 1 200px'
                            }}>
                                <h3 style={{
                                    margin: '0 0 10px 0',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#555'
                                }}>
                                    Sortowanie
                                </h3>
                                <select
                                    value={filters.sortBy || 'date_desc'}
                                    onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        background: 'white'
                                    }}
                                >
                                    <option value="date_desc"> Najnowsze pierwsze</option>
                                    <option value="date_asc">Najstarsze pierwsze</option>
                                    <option value="name_asc">Alfabetycznie A-Z</option>
                                    <option value="name_desc">Alfabetycznie Z-A</option>
                                </select>
                            </div>
                            <h3 style={{
                                margin: '10px 0 10px 0',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#555'
                            }}>
                                Data dodania
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <label style={{ fontSize: '12px', minWidth: '20px' }}>Od:</label>
                                    <input
                                        type="date"
                                        value={filters.dateFrom || ''}
                                        onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                                        style={{
                                            padding: '4px 8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            flex: 1
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <label style={{ fontSize: '12px', minWidth: '20px' }}>Do:</label>
                                    <input
                                        type="date"
                                        value={filters.dateTo || ''}
                                        onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                                        style={{
                                            padding: '4px 8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            flex: 1
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Kolory ubrań w outficie */}
                        <div className="filter-section" style={{
                            minWidth: '200px',
                            flex: '1 1 200px'
                        }}>
                            <h3 style={{
                                margin: '0 0 10px 0',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#555'
                            }}>
                                Kolory ubrań ({(filters.colors || []).length > 0 ? filters.colors.length : 'wszystkie'})
                            </h3>
                            <div className="checkbox-grid" style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px'
                            }}>
                                {colors.map(color => (
                                    <label key={color} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        padding: '4px 8px',
                                        backgroundColor: (filters.colors || []).includes(color) ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={(filters.colors || []).includes(color)}
                                            onChange={(e) => handleColorChange(color, e.target.checked)}
                                            style={{ marginRight: '6px' }}
                                        />
                                        <span>{color}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tagi outfitów */}
                        <div className="filter-section" style={{
                            minWidth: '200px',
                            flex: '1 1 200px'
                        }}>
                            <h3 style={{
                                margin: '0 0 10px 0',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#555'
                            }}>
                                Tagi outfitów ({(filters.tags || []).length > 0 ? filters.tags.length : 'wszystkie'})
                            </h3>
                            <div className="checkbox-grid" style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px'
                            }}>
                                {tags.map(tag => (
                                    <label key={tag} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        padding: '4px 8px',
                                        backgroundColor: (filters.tags || []).includes(tag) ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={(filters.tags || []).includes(tag)}
                                            onChange={(e) => handleTagChange(tag, e.target.checked)}
                                            style={{ marginRight: '6px' }}
                                        />
                                        <span>{tag}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        className="reset-filters-btn"
                        onClick={() => onFiltersChange({ search: '', colors: [], categories: [], tags: [], dateFrom: '', dateTo: '', sortBy: 'date_desc' })}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: 'rgba(231, 76, 60, 0.1)',
                            border: '1px solid rgba(231, 76, 60, 0.3)',
                            borderRadius: '6px',
                            color: '#e74c3c',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Wyczyść wszystkie filtry
                    </button>
                </div>

                <div className="items-grid">
                    {filteredAndSortedOutfits.map(outfit => (
                        <div key={outfit.id} className="outfit-card">
                            <div className="outfit-info">
                                <div className="outfit-name">{outfit.name}</div>

                                <div className="outfit-items">
                                    {outfit.items.map(itemId => {
                                        const item = getItemById(itemId);
                                        return item ? (
                                            <div
                                                key={itemId}
                                                style={{
                                                    position: 'relative',
                                                    cursor: 'pointer'
                                                }}
                                                title={`${item.name} (${item.color}, ${item.category}) - kliknij aby powiększyć`}
                                            >
                                                <img
                                                    src={item.images?.[0]}
                                                    alt={item.name}
                                                    className="outfit-item-image"
                                                    onClick={(e) => handleItemImageClick(item, e)}
                                                />
                                                {item.images && item.images.length > 1 && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '2px',
                                                        right: '2px',
                                                        background: 'rgba(0,0,0,0.7)',
                                                        color: 'white',
                                                        padding: '2px 4px',
                                                        borderRadius: '8px',
                                                        fontSize: '10px',
                                                        fontWeight: '500'
                                                    }}>
                                                        +{item.images.length - 1}
                                                    </div>
                                                )}
                                            </div>
                                        ) : null;
                                    })}
                                </div>

                                {outfit.tags && outfit.tags.length > 0 && (
                                    <div className="tags">
                                        {outfit.tags.map(tag => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginTop: '12px',
                                    flexWrap: 'wrap'
                                }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditOutfit(outfit);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '6px 12px',
                                            background: 'rgba(102, 126, 234, 0.1)',
                                            border: '1px solid rgba(102, 126, 234, 0.3)',
                                            borderRadius: '6px',
                                            color: '#667eea',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            minWidth: '80px'
                                        }}
                                    >
                                        Edytuj
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Czy na pewno chcesz usunąć ten outfit?')) {
                                                onDeleteOutfit(outfit.id);
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '6px 12px',
                                            background: 'rgba(231, 76, 60, 0.1)',
                                            border: '1px solid rgba(231, 76, 60, 0.3)',
                                            borderRadius: '6px',
                                            color: '#e74c3c',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            minWidth: '80px'
                                        }}
                                    >
                                        Usuń
                                    </button>
                                </div>

                                {/* Informacje o elementach outfitu */}
                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px',
                                    background: 'rgba(102, 126, 234, 0.05)',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    color: '#666'
                                }}>
                                    <div style={{ marginBottom: '6px' }}>
                                        <strong>{outfit.items.length} elementów</strong>
                                        <div style={{ float: 'right', color: '#888' }}>
                                            Dodano: {formatDate(outfit.createdAt)}
                                        </div>
                                    </div>
                                    {outfit.updatedAt && outfit.updatedAt !== outfit.createdAt && (
                                        <div style={{ marginBottom: '6px', color: '#888' }}>
                                            Zaktualizowano: {formatDate(outfit.updatedAt)}
                                        </div>
                                    )}
                                    <div style={{ marginTop: '4px', clear: 'both' }}>
                                        {outfit.items.map(itemId => {
                                            const item = getItemById(itemId);
                                            return item ? (
                                                <div key={itemId} style={{
                                                    display: 'inline-block',
                                                    marginRight: '8px',
                                                    marginBottom: '2px'
                                                }}>
                                                    • {item.name} ({item.color})
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAndSortedOutfits.length === 0 && outfits.length > 0 && (
                    <div style={{
                        textAlign: 'center',
                        marginTop: '60px',
                        color: '#7f8c8d',
                        fontSize: '18px'
                    }}>
                        Brak wyników dla wybranych filtrów. Spróbuj zmienić kryteria wyszukiwania.
                    </div>
                )}

                {outfits.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        marginTop: '60px',
                        color: '#7f8c8d',
                        fontSize: '18px'
                    }}>
                        Nie masz jeszcze żadnych outfitów. Stwórz pierwszy!
                    </div>
                )}
            </div>

            {/* Image Viewer Modal */}
            {showImageViewer && viewerItem && (
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
                            <div>
                                <h3>{viewerItem.name}</h3>
                                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                                    {viewerItem.color} • {viewerItem.category}
                                </p>
                                <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>
                                    Zdjęcie {currentImageIndex + 1} z {viewerItem.images.length}
                                </p>
                            </div>
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
                                src={viewerItem.images[currentImageIndex]}
                                alt={`${viewerItem.name} ${currentImageIndex + 1}`}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain',
                                    borderRadius: '8px'
                                }}
                            />

                            {viewerItem.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex(prev =>
                                            prev > 0 ? prev - 1 : viewerItem.images.length - 1
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
                                            prev < viewerItem.images.length - 1 ? prev + 1 : 0
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

                        {viewerItem.images.length > 1 && (
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginTop: '20px',
                                flexWrap: 'wrap',
                                justifyContent: 'center'
                            }}>
                                {viewerItem.images.map((image, index) => (
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

export default OutfitsView;