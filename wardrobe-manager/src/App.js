import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ItemsView from './components/ItemsView';
import OutfitsView from './components/OutfitsView';
import Settings from './components/Settings';
import AddItemModal from './components/AddItemModal';
import ItemEditModal from './components/ItemEditModal';
import OutfitModal from './components/OutfitModal';
import OutfitEditModal from './components/OutfitEditModal';
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
  const [dataLoaded, setDataLoaded] = useState(false);

  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [creatingOutfit, setCreatingOutfit] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState(null);

  const [itemFilters, setItemFilters] = useState({
    color: '',
    category: '',
    tag: '',
    search: '',
    colors: [],
    categories: [],
    tags: [],
    dateFrom: '',
    dateTo: '',
    sortBy: 'date_desc'
  });

  const [outfitFilters, setOutfitFilters] = useState({
    tag: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    colors: [],
    categories: [],
    tags: [],
    sortBy: 'date_desc'
  });

  // Load data on startup - tylko raz przy starcie
  useEffect(() => {
    const loadData = async () => {
      console.log('Loading data...');
      try {
        if (window.electronAPI?.loadData) {
          const result = await window.electronAPI.loadData();
          console.log('Load result:', result);

          if (result?.success && result.data) {
            const data = result.data;
            console.log('Loaded data:', data);

            setItems(data.items || []);
            setOutfits(data.outfits || []);
            setColors(data.colors || colorsList);
            setCategories(data.categories || categoriesList);
            setTags(data.tags || tagsList);
          } else {
            console.log('No saved data found, using defaults');
            // Użyj domyślnych wartości jeśli nie ma zapisanych danych
            setColors(colorsList);
            setCategories(categoriesList);
            setTags(tagsList);
          }
        } else {
          console.log('electronAPI not available, using defaults');
          setColors(colorsList);
          setCategories(categoriesList);
          setTags(tagsList);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // W przypadku błędu użyj domyślnych wartości
        setColors(colorsList);
        setCategories(categoriesList);
        setTags(tagsList);
      } finally {
        setDataLoaded(true);
      }
    };

    loadData();
  }, []); // Pusty array dependency - uruchom tylko raz

  // Auto-save data - zapisuj za każdym razem gdy coś się zmieni (po załadowaniu danych)
  useEffect(() => {
    const saveData = async () => {
      if (!dataLoaded) {
        console.log('Data not loaded yet, skipping save');
        return; // Nie zapisuj dopóki dane nie zostały załadowane
      }

      console.log('Saving data...');
      try {
        const data = { items, outfits, colors, categories, tags };
        console.log('Data to save:', data);

        if (window.electronAPI?.saveData) {
          const result = await window.electronAPI.saveData(data);
          console.log('Save result:', result);
        } else {
          console.log('electronAPI not available for saving');
        }
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    // Zapisuj dane za każdym razem gdy się zmienią (ale tylko po załadowaniu)
    saveData();
  }, [items, outfits, colors, categories, tags, dataLoaded]);

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

  const updateOutfit = (id, updatedOutfit) => {
    setOutfits(prev => prev.map(outfit => outfit.id === id ? { ...outfit, ...updatedOutfit } : outfit));
  };

  // Pokaż loading jeśli dane się jeszcze ładują
  if (!dataLoaded) {
    return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#667eea'
        }}>
          Ładowanie aplikacji...
        </div>
    );
  }

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
                  items={items}
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
                  outfits={outfits}
                  items={items}
                  filters={outfitFilters}
                  onFiltersChange={setOutfitFilters}
                  onDeleteOutfit={deleteOutfit}
                  onEditOutfit={setEditingOutfit}
                  tags={tags}
                  colors={colors}
                  categories={categories}
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
                    try {
                      const result = await window.electronAPI?.importData();
                      if (result?.success && result.data) {
                        const data = result.data;
                        setItems(data.items || []);
                        setOutfits(data.outfits || []);
                        setColors(data.colors || colorsList);
                        setCategories(data.categories || categoriesList);
                        setTags(data.tags || tagsList);
                        console.log('Data imported successfully');
                      }
                    } catch (error) {
                      console.error('Error importing data:', error);
                      alert('Błąd podczas importowania danych: ' + error.message);
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

        {editingOutfit && (
            <OutfitEditModal
                outfit={editingOutfit}
                items={items}
                onClose={() => setEditingOutfit(null)}
                onSave={(updatedOutfit) => {
                  updateOutfit(editingOutfit.id, updatedOutfit);
                  setEditingOutfit(null);
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