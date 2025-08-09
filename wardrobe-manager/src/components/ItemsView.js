import React, { useMemo, useState } from 'react';

function ItemsView({
                       items,
                       filters,
                       onFiltersChange,
                       onEditItem,
                       onDeleteItem,
                       colors,
                       categories,
                       tags
                   }) {

    const [showImageViewer, setShowImageViewer] = useState(false);
    const [viewerItem, setViewerItem] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleColorChange = (color, checked) => {
        const newColors = checked
            ? [...(filters.colors || []), color]
            : (filters.colors || []).filter(c => c !== color);
        onFiltersChange({ ...filters, colors: newColors });
    };

    const handleCategoryChange = (category, checked) => {
        const newCategories = checked
            ? [...(filters.categories || []), category]
            : (filters.categories || []).filter(c => c !== category);
        onFiltersChange({ ...filters, categories: newCategories });
    };

    const handleTagChange = (tag, checked) => {
        const newTags = checked
            ? [...(filters.tags || []), tag]
            : (filters.tags || []).filter(t => t !== tag);
        onFiltersChange({ ...filters, tags: newTags });
    };

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

    const filterByDateRange = (item) => {
        if (!filters.dateFrom && !filters.dateTo) return true;

        const itemDate = new Date(item.createdAt || item.updatedAt || '2000-01-01');
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : new Date('2000-01-01');
        const toDate = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59') : new Date('2100-12-31');

        return itemDate >= fromDate && itemDate <= toDate;
    };

    // Filtrowanie i sortowanie elementów
    const filteredAndSortedItems = useMemo(() => {
        // Najpierw filtrujemy
        let filtered = items.filter(item => {
            // Wyszukiwanie tekstowe
            if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            // Kolory - jeśli wybrane, item musi mieć jeden z wybranych kolorów
            if (filters.colors?.length > 0 && !filters.colors.includes(item.color)) {
                return false;
            }

            // Kategorie
            if (filters.categories?.length > 0 && !filters.categories.includes(item.category)) {
                return false;
            }

            // Tagi - item musi mieć przynajmniej jeden z wybranych tagów
            if (filters.tags?.length > 0 && !filters.tags.some(tag => item.tags?.includes(tag))) {
                return false;
            }

            // Filtr daty
            if (!filterByDateRange(item)) {
                return false;
            }

            return true;
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
    }, [items, filters]);

    const openImageViewer = (item, imageIndex = 0) => {
        setViewerItem(item);
        setCurrentImageIndex(imageIndex);
        setShowImageViewer(true);
    };

    const handleItemClick = (item, e) => {
        // Jeśli kliknięto na zdjęcie, otwórz viewer
        if (e.target.tagName === 'IMG') {
            e.stopPropagation();
            openImageViewer(item, 0);
        } else {
            // W przeciwnym razie edytuj item
            onEditItem(item);
        }
    };

    return (
        <>
            <div>
                <div className="view-header">
                    <h1 className="view-title">Twoje ubrania</h1>
                    <div className="view-stats">
                        {filteredAndSortedItems.length} z {items.length} elementów
                    </div>
                </div>

                <div className="filters" style={{ marginBottom: '30px' }}>
                    <input
                        type="text"
                        placeholder="Szukaj..."
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
                                    <option value="date_desc">Najnowsze pierwsze</option>
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

                        {/* Kolory */}
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
                                Kolory ({(filters.colors || []).length > 0 ? filters.colors.length : 'wszystkie'})
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

                        {/* Kategorie */}
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
                                Kategorie ({(filters.categories || []).length > 0 ? filters.categories.length : 'wszystkie'})
                            </h3>
                            <div className="checkbox-grid" style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px'
                            }}>
                                {categories.map(category => (
                                    <label key={category} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        padding: '4px 8px',
                                        backgroundColor: (filters.categories || []).includes(category) ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={(filters.categories || []).includes(category)}
                                            onChange={(e) => handleCategoryChange(category, e.target.checked)}
                                            style={{ marginRight: '6px' }}
                                        />
                                        <span>{category}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tagi */}
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
                                Tagi ({(filters.tags || []).length > 0 ? filters.tags.length : 'wszystkie'})
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
                </div>

                <div className="items-grid">
                    {filteredAndSortedItems.map(item => (
                        <div
                            key={item.id}
                            className="item-card"
                            onClick={(e) => handleItemClick(item, e)}
                        >
                            {item.images && item.images.length > 0 && (
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={item.images[0]}
                                        alt={item.name}
                                        className="item-image"
                                        style={{ cursor: 'pointer' }}
                                        title="Kliknij aby powiększyć zdjęcie"
                                    />
                                    {item.images.length > 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            +{item.images.length - 1}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="item-info">
                                <div className="item-name">{item.name}</div>
                                <div className="item-details">
                                    <div>Kolor: {item.color}</div>
                                    <div>Kategoria: {item.category}</div>
                                    {item.notes && <div>Notatki: {item.notes}</div>}
                                    <div>
                                        Data utworzenia: {new Date(item.createdAt).toLocaleString("pl-PL", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                    </div>

                                </div>
                                {item.tags && item.tags.length > 0 && (
                                    <div className="tags">
                                        {item.tags.map(tag => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditItem(item);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '6px 12px',
                                            background: 'rgba(102, 126, 234, 0.1)',
                                            border: '1px solid rgba(102, 126, 234, 0.3)',
                                            borderRadius: '6px',
                                            color: '#667eea',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Edytuj
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Czy na pewno chcesz usunąć ten element?')) {
                                                onDeleteItem(item.id);
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '6px 12px',
                                            background: 'rgba(231, 76, 60, 0.1)',
                                            border: '1px solid rgba(231, 76, 60, 0.3)',
                                            borderRadius: '6px',
                                            color: '#e74c3c',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Usuń
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAndSortedItems.length === 0 && items.length > 0 && (
                    <div style={{
                        textAlign: 'center',
                        marginTop: '60px',
                        color: '#7f8c8d',
                        fontSize: '18px'
                    }}>
                        Brak wyników dla wybranych filtrów. Spróbuj zmienić kryteria wyszukiwania.
                    </div>
                )}

                {items.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        marginTop: '60px',
                        color: '#7f8c8d',
                        fontSize: '18px'
                    }}>
                        Nie znaleziono ubrań. Dodaj pierwsze ubranie do szafy!
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

export default ItemsView;