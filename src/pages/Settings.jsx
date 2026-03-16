import React, { useRef } from 'react';
import { useRecipeStore } from '../stores/useRecipeStore';
import { exportRecipesData, importRecipesData } from '../utils/storage';
import Navigation from '../components/Navigation';

const Settings = () => {
  const { recipes, overwriteRecipes } = useRecipeStore();
  const fileInputRef = useRef(null);

  const handleExport = () => {
    exportRecipesData(recipes);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm('Attenzione: importando questo file sovrascriverai TUTTE le tue ricette attuali. Vuoi procedere?')) {
      importRecipesData(
        file, 
        (data) => {
          overwriteRecipes(data);
          alert('Importazione completata con successo!');
        }, 
        (errorMsg) => {
          alert('Errore durante l\'importazione: ' + errorMsg);
        }
      );
    }
    
    // Reset input
    e.target.value = null;
  };

  return (
    <>
      <Navigation title="Impostazioni" showBack={true} />

      <div style={{ paddingBottom: '40px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Gestione Dati</h2>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Esporta Ricette</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
              Scarica un file JSON con tutte le tue ricette e i log di cottura. Il file può essere usato come backup.
            </p>
            <button className="btn" onClick={handleExport} disabled={recipes.length === 0}>
              Esporta {recipes.length} ricette in JSON
            </button>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '24px 0' }} />

          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Importa Ricette</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
              Carica un file JSON precedentemente esportato. <strong style={{ color: '#D32F2F' }}>Attenzione: QUESTA AZIONE SOVRASCRIVERÀ I DATI ATTUALI!</strong>
            </p>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <button className="btn btn-danger" onClick={handleImportClick}>
              Importa file JSON...
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
