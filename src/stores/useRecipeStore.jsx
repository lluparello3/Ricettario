import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getRecipesFromStorage, saveRecipesToStorage } from '../utils/storage';

const RecipeContext = createContext();

export const useRecipeStore = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipeStore must be used within a RecipeProvider');
  }
  return context;
};

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initially
  useEffect(() => {
    const loadedRecipes = getRecipesFromStorage();
    setRecipes(loadedRecipes);
    setIsLoaded(true);
  }, []);

  // Sync to storage whenever it changes, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      saveRecipesToStorage(recipes);
    }
  }, [recipes, isLoaded]);

  const addRecipe = useCallback((recipe) => {
    setRecipes(prev => [...prev, recipe]);
  }, []);

  const updateRecipe = useCallback((id, updatedRecipe) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...updatedRecipe, updatedAt: new Date().toISOString() } : r));
  }, []);

  const deleteRecipe = useCallback((id) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  }, []);

  const overwriteRecipes = useCallback((newRecipes) => {
    setRecipes(newRecipes);
  }, []);

  const getRecipe = useCallback((id) => {
    return recipes.find(r => r.id === id);
  }, [recipes]);

  return (
    <RecipeContext.Provider value={{
      recipes,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      overwriteRecipes,
      getRecipe
    }}>
      {children}
    </RecipeContext.Provider>
  );
};
