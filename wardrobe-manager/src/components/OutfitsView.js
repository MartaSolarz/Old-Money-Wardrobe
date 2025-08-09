import React from 'react';

function OutfitsView({
                         outfits,
                         items,
                         filters,
                         onFiltersChange,
                         onDeleteOutfit,
                         tags
                     }) {
    const getItemById = (id) => items.find(item => item.id === id);

    return (
        <div>
            <div className="view-header">
                <h1 className="view-title">Twoje outfity</h1>
                <div className="view-stats">
                    {outfits.length} outfitów
                </div>
            </div>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Szukaj outfitów lub ubrań..."
                    className="filter-input"
                    value={filters.search}
                    onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                />

                <select
                    className="filter-select"
                    value={filters.tag}
                    onChange={(e) => onFiltersChange({ ...filters, tag: e.target.value })}
                >
                    <option value="">Wszystkie tagi</option>
                    {tags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>

            <div className="items-grid">
                {outfits.map(outfit => (
                    <div key={outfit.id} className="outfit-card">
                        <div className="outfit-info">
                            <div className="outfit-name">{outfit.name}</div>

                            <div className="outfit-items">
                                {outfit.items.map(itemId => {
                                    const item = getItemById(itemId);
                                    return item ? (
                                        <img
                                            key={itemId}
                                            src={item.images?.[0]}
                                            alt={item.name}
                                            className="outfit-item-image"
                                            title={item.name}
                                        />
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

                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Czy na pewno chcesz usunąć ten outfit?')) {
                                        onDeleteOutfit(outfit.id);
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
                                Usuń outfit
                            </button>
                        </div>
                    </div>
                ))}
            </div>

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
    );
}

export default OutfitsView;