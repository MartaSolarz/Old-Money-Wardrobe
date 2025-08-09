import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ItemsView from './components/ItemsView';
import OutfitsView from './components/OutfitsView';
import Settings from './components/Settings';
import AddItemModal from './components/AddItemModal';
import ItemEditModal from './components/ItemEditModal';
import OutfitModal from './components/OutfitModal';
import { v4 as uuidv4 } from 'uuid';

const colorsList = ['Czarny', 'Biały', 'Beżowy', 'Khaki', 'Navy', 'Burgund', 'Zielony', 'Szary', 'Brązowy', 'Czerwony', 'Różowy', 'Srebrny', 'Złoty', 'Pomarańczowy', 'Fioletowy', 'Niebieski'];
const categoriesList = ['Koszula', 'Spodnie', 'Sukienka', 'Marynarka', 'Spódnica', 'Buty', 'Pasek', 'Biżuteria', 'Chusta', 'Sweter'];
const tagsList = ['Casual', 'Eleganckie', 'Sport', 'Praca', 'Wieczorowe'];

function App() {
  const [currentView, setCurrentView] = useState('items');
  const [items, setItems] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [colors, setColors] = useState(colorsList);
  const [categories, setCategories] = useState(categoriesList);
  const [tags, setTags] = useState(tagsList);

  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [creatingOutfit, setCreatingOutfit] = useState(false);

  const [itemFilters, setItemFilters] = useState({ color: '', category: '', tag: '', search: '' });
  const [outfitFilters, setOutfitFilters] = useState({ tag: '', search: '' });

  // Auto-save data
  useEffect(() => {
    const saveData = async () => {
      const data = { items, outfits, colors, categories, tags };
      await window.electronAPI?.saveData(data);
    };

    if (items.length > 0 || outfits.length > 0) {
      saveData();
    }
  }, [items, outfits, colors, categories, tags]);

  // Load data on startup
  useEffect(() => {
    const loadData = async () => {
      const result = await window.electronAPI?.loadData();
      if (result?.success && result.data) {
        const data = result.data;
        setItems(data.items || []);
        setOutfits(data.outfits || []);
        setColors(data.colors || colorsList);
        setCategories(data.categories || categoriesList);
        setTags(data.tags || tagsList);
      }
    };
    loadData();
  }, []);

  const addItems = (newItems) => {
    const itemsWithId = newItems.map(item => ({ ...item, id: uuidv4() }));
    setItems(prev => [...prev, ...itemsWithId]);
  };

  const updateItem = (id, updatedItem) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
  };

  const deleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const addOutfit = (outfit) => {
    const outfitWithId = { ...outfit, id: uuidv4() };
    setOutfits(prev => [...prev, outfitWithId]);
  };

  const deleteOutfit = (id) => {
    setOutfits(prev => prev.filter(outfit => outfit.id !== id));
  };

  const filteredItems = items.filter(item => {
    return (!itemFilters.color || item.color === itemFilters.color) &&
        (!itemFilters.category || item.category === itemFilters.category) &&
        (!itemFilters.tag || item.tags?.includes(itemFilters.tag)) &&
        (!itemFilters.search || item.name.toLowerCase().includes(itemFilters.search.toLowerCase()));
  });

  const filteredOutfits = outfits.filter(outfit => {
    const matchesTag = !outfitFilters.tag || outfit.tags?.includes(outfitFilters.tag);
    const matchesSearch = !outfitFilters.search ||
        outfit.name.toLowerCase().includes(outfitFilters.search.toLowerCase()) ||
        outfit.items.some(itemId => {
          const item = items.find(i => i.id === itemId);
          return item?.name.toLowerCase().includes(outfitFilters.search.toLowerCase());
        });
    return matchesTag && matchesSearch;
  });

  return (
      <div className="app">
        <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            onAddItem={() => setShowAddItem(true)}
            onCreateOutfit={() => setCreatingOutfit(true)}
        />

        <main className="main-content">
          {currentView === 'items' && (
              <ItemsView
                  items={filteredItems}
                  filters={itemFilters}
                  onFiltersChange={setItemFilters}
                  onEditItem={setEditingItem}
                  onDeleteItem={deleteItem}
                  colors={colors}
                  categories={categories}
                  tags={tags}
              />
          )}

          {currentView === 'outfits' && (
              <OutfitsView
                  outfits={filteredOutfits}
                  items={items}
                  filters={outfitFilters}
                  onFiltersChange={setOutfitFilters}
                  onDeleteOutfit={deleteOutfit}
                  tags={tags}
              />
          )}

          {currentView === 'settings' && (
              <Settings
                  colors={colors}
                  categories={categories}
                  tags={tags}
                  onColorsChange={setColors}
                  onCategoriesChange={setCategories}
                  onTagsChange={setTags}
                  onExport={() => window.electronAPI?.exportData()}
                  onImport={async () => {
                    const result = await window.electronAPI?.importData();
                    if (result?.success && result.data) {
                      const data = result.data;
                      setItems(data.items || []);
                      setOutfits(data.outfits || []);
                      setColors(data.colors || []);
                      setCategories(data.categories || []);
                      setTags(data.tags || []);
                    }
                  }}
              />
          )}
        </main>

        {showAddItem && (
            <AddItemModal
                onClose={() => setShowAddItem(false)}
                onSave={addItems}
                colors={colors}
                categories={categories}
                tags={tags}
            />
        )}

        {editingItem && (
            <ItemEditModal
                item={editingItem}
                onClose={() => setEditingItem(null)}
                onSave={(updatedItem) => {
                  updateItem(editingItem.id, updatedItem);
                  setEditingItem(null);
                }}
                colors={colors}
                categories={categories}
                tags={tags}
            />
        )}

        {creatingOutfit && (
            <OutfitModal
                items={items}
                onClose={() => setCreatingOutfit(false)}
                onSave={(outfit) => {
                  addOutfit(outfit);
                  setCreatingOutfit(false);
                }}
                colors={colors}
                categories={categories}
                tags={tags}
            />
        )}
      </div>
  );
}

export default App;