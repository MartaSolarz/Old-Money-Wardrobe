import React, { useMemo } from 'react';

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

    // Funkcje pomocnicze do obsługi checkboxów
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

    // Filtrowanie elementów
    const filteredItems = useMemo(() => {
        return items.filter(item => {
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

            return true;
        });
    }, [items, filters]);

    return (
        <div>
            <div className="view-header">
                <h1 className="view-title">Twoje ubrania</h1>
                <div className="view-stats">
                    {filteredItems.length} z {items.length} elementów
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

                <button
                    className="reset-filters-btn"
                    onClick={() => onFiltersChange({ search: '', colors: [], categories: [], tags: [] })}
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
                {filteredItems.map(item => (
                    <div
                        key={item.id}
                        className="item-card"
                        onClick={() => onEditItem(item)}
                    >
                        {item.images && item.images.length > 0 && (
                            <img
                                src={item.images[0]}
                                alt={item.name}
                                className="item-image"
                            />
                        )}
                        <div className="item-info">
                            <div className="item-name">{item.name}</div>
                            <div className="item-details">
                                <div>Kolor: {item.color}</div>
                                <div>Kategoria: {item.category}</div>
                                {item.notes && <div>Notatki: {item.notes}</div>}
                            </div>
                            {item.tags && item.tags.length > 0 && (
                                <div className="tags">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                            )}

                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Czy na pewno chcesz usunąć ten element?')) {
                                        onDeleteItem(item.id);
                                    }
                                }}
                                style={{
                                    marginTop: '12px',
                                    padding: '6px 12px',
                                    background: 'rgba(231, 76, 60, 0.1)',
                                    border: '1px solid rgba(231, 76, 60, 0.3)',
                                    borderRadius: '6px',
                                    color: '#e74c3c'
                                }}
                            >
                                Usuń element
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && items.length > 0 && (
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
    );
}

export default ItemsView;