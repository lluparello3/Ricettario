import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useStorage } from './hooks/useStorage';
import { useShoppingList } from './hooks/useShoppingList';

import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Container } from './components/layout/Container';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { RecipeFormPage } from './pages/RecipeFormPage';
import { ShoppingListPage } from './pages/ShoppingListPage';
import { SettingsBackupPage } from './pages/SettingsBackupPage';
import { Loader2, WifiOff } from 'lucide-react';

export default function App() {
  const {
    recipes,
    shoppingList,
    appConfig,
    isLoading,
    errorNotice,
    saveRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    resetToSampleData
  } = useStorage();

  const { addRecipesToShoppingList } = useShoppingList();

  const handleSaveRecipe = async (recipeData) => {
    const exists = recipes.some((r) => r.id === recipeData.id);
    if (exists) {
      await updateRecipe(recipeData.id, recipeData);
    } else {
      await addRecipe(recipeData);
    }
  };

  const handleAddRecipesToShopping = (recipeSelections, includeLinked = false) => {
    addRecipesToShoppingList(recipeSelections, recipes, includeLinked);
  };

  return (
    <Router>
      <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden flex flex-col bg-[#faf7f2] text-stone-800 font-sans selection:bg-amber-200 selection:text-amber-900">
        {/* Top Navbar */}
        <Navbar shoppingCount={shoppingList.length} />

        {/* Offline / Error Notice Banner */}
        {errorNotice && (
          <div className="bg-amber-800 text-amber-100 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-1.5 font-medium no-print">
            <WifiOff className="w-3.5 h-3.5 text-amber-300" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Main Content View */}
        <Container className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Sincronizzazione Supabase Cloud...
              </p>
            </div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    recipes={recipes}
                    onAddToShopping={(recipe) =>
                      handleAddRecipesToShopping([{ recipe, servings: recipe.servings }], false)
                    }
                  />
                }
              />
              <Route
                path="/catalog"
                element={
                  <CatalogPage
                    recipes={recipes}
                    onAddRecipesToShopping={handleAddRecipesToShopping}
                  />
                }
              />
              <Route
                path="/recipes/new"
                element={
                  <RecipeFormPage
                    recipes={recipes}
                    onSaveRecipe={handleSaveRecipe}
                  />
                }
              />
              <Route
                path="/recipes/:id"
                element={
                  <RecipeDetailPage
                    recipes={recipes}
                    onDeleteRecipe={deleteRecipe}
                    onAddRecipesToShopping={handleAddRecipesToShopping}
                  />
                }
              />
              <Route
                path="/recipes/:id/edit"
                element={
                  <RecipeFormPage
                    recipes={recipes}
                    onSaveRecipe={handleSaveRecipe}
                  />
                }
              />
              <Route path="/shopping" element={<ShoppingListPage />} />
              <Route
                path="/settings"
                element={
                  <SettingsBackupPage
                    recipes={recipes}
                    shoppingList={shoppingList}
                    appConfig={appConfig}
                    onImportRecipes={(mergedRecipes) => saveRecipes(mergedRecipes)}
                    onResetSampleData={resetToSampleData}
                  />
                }
              />
            </Routes>
          )}
        </Container>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav shoppingCount={shoppingList.length} />
      </div>
    </Router>
  );
}
