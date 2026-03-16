import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeStore } from '../stores/useRecipeStore';
import Navigation from '../components/Navigation';
import RecipeCard from '../components/RecipeCard';
import Chip from '../components/Chip';

const IngredientSearch = () => {
  const { recipes } = useRecipeStore();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState([]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const searchResults = useMemo(() => {
    if (tags.length === 0) return [];

    return recipes.filter(recipe => {
      // AND search logic: recipe must contain ALL tags
      return tags.every(tag => {
        // checks if any ingredient in this recipe matches the tag
        return recipe.ingredients?.some(ing => 
          ing.name?.toLowerCase().includes(tag)
        );
      });
    });
  }, [recipes, tags]);

  return (
    <>
      <Navigation title="Cerca per Ingrediente" showBack={true} />

      <div style={{ paddingBottom: '40px' }}>
        <div className="card">
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Scrivi un ingrediente e premi Invio. Verranno mostrate le ricette che contengono <strong>tutti</strong> gli ingredienti inseriti.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', border: '2px solid var(--accent-color)', borderRadius: '8px', background: '#fff', minHeight: '52px', alignItems: 'center' }}>
            {tags.map(tag => (
              <Chip 
                key={tag} 
                label={tag} 
                active={true} 
                onRemove={() => removeTag(tag)} 
              />
            ))}
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? "Es. farina, uova..." : "Aggiungi altro..."}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: '120px', padding: '4px', boxShadow: 'none' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          {tags.length > 0 && (
            <h3 style={{ marginBottom: '16px', color: '#555' }}>
              Risultati ({searchResults.length})
            </h3>
          )}

          {tags.length > 0 && searchResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
              <p>Nessuna ricetta contiene tutti questi ingredienti.</p>
            </div>
          ) : (
            searchResults.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          )}

          {tags.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ccc' }}>
              <p>Inizia a digitare per cercare</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default IngredientSearch;
