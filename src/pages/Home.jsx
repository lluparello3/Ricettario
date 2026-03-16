import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeStore } from '../stores/useRecipeStore';
import Navigation from '../components/Navigation';
import RecipeCard from '../components/RecipeCard';
import Chip from '../components/Chip';
import { Plus } from 'lucide-react';
import { RECIPE_CATEGORIES } from '../utils/helpers';

const Home = () => {
  const { recipes } = useRecipeStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('tutti');

  const filteredRecipes = useMemo(() => {
    let result = [...recipes];
    
    // Sort by updatedAt descending
    result.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

    // Filter by search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(lowerSearch));
    }

    // Filter by category
    if (filterCategory !== 'tutti') {
      result = result.filter(r => r.category === filterCategory);
    }

    return result;
  }, [recipes, searchTerm, filterCategory]);

  return (
    <>
      <Navigation title="Le mie ricette" />
      
      <div style={{ paddingBottom: '80px' }}>
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Cerca per nome..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="chips-container" style={{ overflowX: 'auto', paddingBottom: '8px', flexWrap: 'nowrap' }}>
          <Chip 
            label="Tutti" 
            active={filterCategory === 'tutti'} 
            onClick={() => setFilterCategory('tutti')} 
          />
          {RECIPE_CATEGORIES.map(cat => (
            <Chip 
              key={cat.value} 
              label={cat.label} 
              active={filterCategory === cat.value} 
              onClick={() => setFilterCategory(cat.value)} 
            />
          ))}
        </div>

        <div style={{ marginTop: '24px' }}>
          {filteredRecipes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
              <p>Nessuna ricetta trovata.</p>
              <button className="btn" style={{ marginTop: '16px' }} onClick={() => navigate('/recipe/new')}>
                Crea la tua prima ricetta
              </button>
            </div>
          ) : (
            filteredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          )}
        </div>
      </div>

      <button className="fab" onClick={() => navigate('/recipe/new')} title="Nuova ricetta">
        <Plus size={32} />
      </button>
    </>
  );
};

export default Home;
