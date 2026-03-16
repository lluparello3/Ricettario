import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeStore } from '../stores/useRecipeStore';
import Navigation from '../components/Navigation';
import Chip from '../components/Chip';
import AiAnalysisPanel from '../components/AiAnalysisPanel';
import { generateId, RECIPE_CATEGORIES, RECIPE_STATUSES, RECIPE_TOOLS, UNIT_OPTIONS } from '../utils/helpers';
import { Plus, Trash2 } from 'lucide-react';

const RecipeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipe, addRecipe, updateRecipe } = useRecipeStore();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    category: 'primo',
    status: 'da_provare',
    tools: [],
    baseServings: 2,
    photoUrl: '',
    procedure: '',
    notes: '',
    links: [],
    ingredients: [],
    cookLogs: []
  });

  useEffect(() => {
    if (isEdit) {
      const existing = getRecipe(id);
      if (existing) {
        setFormData(existing);
      } else {
        navigate('/');
      }
    }
  }, [id, isEdit, getRecipe, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToolToggle = (tool) => {
    setFormData(prev => {
      if (prev.tools.includes(tool)) {
        return { ...prev, tools: prev.tools.filter(t => t !== tool) };
      }
      return { ...prev, tools: [...prev.tools, tool] };
    });
  };

  // -- Dynamic Lists Hands --
  const addIngredientRow = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { id: generateId(), name: '', quantity: 0, unit: 'g', note: '' }]
    }));
  };
  
  const updateIngredient = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.ingredients];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, ingredients: updated };
    });
  };

  const removeIngredient = (index) => {
    setFormData(prev => {
      const updated = [...prev.ingredients];
      updated.splice(index, 1);
      return { ...prev, ingredients: updated };
    });
  };

  const addLinkRow = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { id: generateId(), label: '', url: '' }]
    }));
  };

  const updateLink = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.links];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, links: updated };
    });
  };

  const removeLink = (index) => {
    setFormData(prev => {
      const updated = [...prev.links];
      updated.splice(index, 1);
      return { ...prev, links: updated };
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Il nome della ricetta è obbligatorio.');
      return;
    }

    const payload = {
      ...formData,
      baseServings: Number(formData.baseServings) || 1,
      updatedAt: new Date().toISOString(),
    };

    if (isEdit) {
      updateRecipe(id, payload);
      navigate(`/recipe/${id}`);
    } else {
      const newId = generateId();
      payload.id = newId;
      payload.createdAt = new Date().toISOString();
      addRecipe(payload);
      navigate(`/recipe/${newId}`);
    }
  };

  return (
    <>
      <Navigation title={isEdit ? "Modifica Ricetta" : "Nuova Ricetta"} showBack={true} />

      <div style={{ paddingBottom: '40px' }}>
        <div className="card">
          <div className="form-group">
            <label>Nome Ricetta *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', gap: '16px', flexDirection: 'row', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>Categoria</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {RECIPE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>Stato</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                {RECIPE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Porzioni Base</label>
            <input 
              type="number" 
              name="baseServings" 
              value={formData.baseServings} 
              onChange={handleChange} 
              min="1" 
              style={{ width: '100px' }}
            />
          </div>

          <div className="form-group">
            <label>URL Foto (opzionale)</label>
            <input type="url" name="photoUrl" value={formData.photoUrl || ''} onChange={handleChange} placeholder="https://..." />
          </div>

          <div className="form-group">
            <label>Strumenti (Multi-select)</label>
            <div className="chips-container">
              {RECIPE_TOOLS.map(tool => (
                <Chip 
                  key={tool} 
                  label={tool} 
                  active={formData.tools.includes(tool)} 
                  onClick={() => handleToolToggle(tool)} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- INGREDIENTS --- */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Ingredienti</h2>
            <button className="icon-btn" onClick={addIngredientRow} style={{ background: '#E8F5E9', color: '#2E7D32' }}>
              <Plus size={20} />
            </button>
          </div>
          
          {formData.ingredients.length === 0 && <p style={{ color: '#888', fontStyle: 'italic' }}>Nessun ingrediente aggiunto.</p>}

          {formData.ingredients.map((ing, idx) => (
            <div key={ing.id || idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', background: '#fcfcfc', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
              <div style={{ flex: '1 1 200px' }}>
                <input 
                  type="text" 
                  placeholder="Nome (es. Farina)" 
                  value={ing.name} 
                  onChange={(e) => updateIngredient(idx, 'name', e.target.value)} 
                />
              </div>
              <div style={{ flex: '1 1 80px' }}>
                <input 
                  type="number" 
                  placeholder="Quantità" 
                  value={ing.quantity} 
                  onChange={(e) => updateIngredient(idx, 'quantity', Number(e.target.value))} 
                />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <select value={ing.unit} onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}>
                  {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <input 
                  type="text" 
                  placeholder="Nota (opz. es. setacciata)" 
                  value={ing.note || ''} 
                  onChange={(e) => updateIngredient(idx, 'note', e.target.value)} 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button className="icon-btn" onClick={() => removeIngredient(idx)} style={{ color: '#D32F2F', background: '#FFEBEE' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* --- PROCEDURE --- */}
        <div className="card">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Procedura</label>
            <textarea 
              name="procedure" 
              value={formData.procedure} 
              onChange={handleChange} 
              placeholder="1. Mescola gli ingredienti..."
              style={{ minHeight: '150px' }}
            />
          </div>
        </div>

        {/* --- NOTES --- */}
        <div className="card" style={{ background: '#FFF8E1', borderColor: '#FFE082' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ color: '#F57F17' }}>Note & Trucchi</label>
            <textarea 
              name="notes" 
              value={formData.notes || ''} 
              onChange={handleChange} 
              placeholder="Il segreto per un sapore migliore..."
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(245, 127, 23, 0.2)' }}
            />
          </div>
        </div>

        {/* --- LINKS --- */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Link Utili</h2>
            <button className="icon-btn" onClick={addLinkRow} style={{ background: '#E3F2FD', color: '#1565C0' }}>
              <Plus size={20} />
            </button>
          </div>

          {formData.links.length === 0 && <p style={{ color: '#888', fontStyle: 'italic' }}>Nessun link aggiunto.</p>}

          {formData.links.map((link, idx) => (
            <div key={link.id || idx} style={{ marginBottom: '16px', background: '#fcfcfc', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div style={{ flex: '1 1 150px' }}>
                  <input 
                    type="text" 
                    placeholder="Etichetta (es. Ricetta originale)" 
                    value={link.label || ''} 
                    onChange={(e) => updateLink(idx, 'label', e.target.value)} 
                  />
                </div>
                <div style={{ flex: '2 1 200px' }}>
                  <input 
                    type="url" 
                    placeholder="https://..." 
                    value={link.url} 
                    onChange={(e) => updateLink(idx, 'url', e.target.value)} 
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button className="icon-btn" onClick={() => removeLink(idx)} style={{ color: '#D32F2F', background: '#FFEBEE' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {/* User requested Analizza button also in the edit screen ("Crea / Modifica ricetta ... Link: lista dinamica, ogni riga ha: label + URL + bottone "Analizza"") */}
              {link.url && (
                <div style={{ marginTop: '8px' }}>
                  <AiAnalysisPanel url={link.url} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- ACTIONS --- */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn" onClick={() => navigate(-1)} style={{ minWidth: '120px' }}>
            Annulla
          </button>
          <button className="btn btn-primary" onClick={handleSave} style={{ minWidth: '120px' }}>
            Salva Ricetta
          </button>
        </div>

      </div>
    </>
  );
};

export default RecipeEdit;
