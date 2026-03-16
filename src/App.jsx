import React from 'react';
import { RecipeProvider } from './stores/useRecipeStore';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RecipeView from './pages/RecipeView';
import RecipeEdit from './pages/RecipeEdit';
import IngredientSearch from './pages/IngredientSearch';
import Settings from './pages/Settings';

function App() {
  return (
    <RecipeProvider>
      <BrowserRouter>
        <div className="app-container">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recipe/new" element={<RecipeEdit />} />
              <Route path="/recipe/:id" element={<RecipeView />} />
              <Route path="/recipe/:id/edit" element={<RecipeEdit />} />
              <Route path="/search" element={<IngredientSearch />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </RecipeProvider>
  );
}

export default App;
