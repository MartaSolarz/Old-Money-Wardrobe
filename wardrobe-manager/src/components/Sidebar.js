import React from 'react';

function Sidebar({ currentView, onViewChange, onAddItem, onBulkAddItems, onCreateOutfit }) {
    return (
        <div className="sidebar">
            <div className="logo">Wardrobe Manager</div>

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
                <button className="btn-secondary" onClick={onBulkAddItems}>
                    + Dodaj wiele ubrań naraz
                </button>
                <button className="btn-secondary" onClick={onCreateOutfit}>
                    + Stwórz outfit
                </button>
            </div>
        </div>
    );
}

export default Sidebar;