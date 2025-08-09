import React from 'react';

function Sidebar({ currentView, onViewChange, onAddItem, onCreateOutfit }) {
    return (
        <div className="sidebar">
            <div className="logo">Wardrobe</div>

            <nav>
                <div
                    className={`nav-item ${currentView === 'items' ? 'active' : ''}`}
                    onClick={() => onViewChange('items')}
                >
                    Ubrania
                </div>
                <div
                    className={`nav-item ${currentView === 'outfits' ? 'active' : ''}`}
                    onClick={() => onViewChange('outfits')}
                >
                    Outfity
                </div>
                <div
                    className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
                    onClick={() => onViewChange('settings')}
                >
                    Ustawienia
                </div>
            </nav>

            <div className="action-buttons">
                <button className="btn-primary" onClick={onAddItem}>
                    + Dodaj ubranie
                </button>
                <button className="btn-secondary" onClick={onCreateOutfit}>
                    + Stwórz outfit
                </button>
            </div>
        </div>
    );
}

export default Sidebar;