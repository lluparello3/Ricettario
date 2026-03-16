export const StorageKeys = {
  RECIPES: 'le_mie_ricette_data'
};

export const getRecipesFromStorage = () => {
  try {
    const data = localStorage.getItem(StorageKeys.RECIPES);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading from localStorage', err);
    return [];
  }
};

export const saveRecipesToStorage = (recipes) => {
  try {
    localStorage.setItem(StorageKeys.RECIPES, JSON.stringify(recipes));
  } catch (err) {
    console.error('Error writing to localStorage', err);
  }
};

export const exportRecipesData = (recipes) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recipes, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", "le_mie_ricette_export.json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const importRecipesData = (file, onSuccess, onError) => {
  const fileReader = new FileReader();
  fileReader.readAsText(file, "UTF-8");
  fileReader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        onSuccess(data);
      } else {
        onError("Il file non contiene un array valido di ricette.");
      }
    } catch (err) {
      onError("Errore nel parsing del file JSON.");
    }
  };
};
