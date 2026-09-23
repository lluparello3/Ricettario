/**
 * JSON Backup Export and Import Helper with deduplication by title.
 */

export const exportAppData = (recipes, shoppingList, appConfig) => {
  const data = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    recipes: recipes || [],
    shoppingList: shoppingList || [],
    appConfig: appConfig || {}
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonString);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute("download", `ricettario_backup_${timestamp}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const mergeRecipesByTitle = (existingRecipes = [], importedRecipes = []) => {
  let addedCount = 0;
  let updatedCount = 0;

  const recipesMap = new Map();
  
  // Populate existing map keyed by normalized title
  existingRecipes.forEach((recipe) => {
    if (recipe && recipe.title) {
      const normTitle = recipe.title.trim().toLowerCase();
      recipesMap.set(normTitle, recipe);
    }
  });

  // Process imported recipes
  importedRecipes.forEach((impRecipe) => {
    if (!impRecipe || !impRecipe.title) return;
    const normTitle = impRecipe.title.trim().toLowerCase();
    
    if (recipesMap.has(normTitle)) {
      // Overwrite existing with imported, maintaining ID if needed or taking imported ID
      const existing = recipesMap.get(normTitle);
      recipesMap.set(normTitle, {
        ...impRecipe,
        id: impRecipe.id || existing.id
      });
      updatedCount++;
    } else {
      // Add new recipe
      recipesMap.set(normTitle, {
        ...impRecipe,
        id: impRecipe.id || crypto.randomUUID()
      });
      addedCount++;
    }
  });

  const mergedList = Array.from(recipesMap.values());
  return {
    mergedList,
    summary: {
      totalImported: importedRecipes.length,
      addedCount,
      updatedCount
    }
  };
};
