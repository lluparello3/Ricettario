import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeStore } from '../stores/useRecipeStore';
import Navigation from '../components/Navigation';
import Badge from '../components/Badge';
import Chip from '../components/Chip';
import PortionSelector from '../components/PortionSelector';
import AiAnalysisPanel from '../components/AiAnalysisPanel';
import { calculateAmount, formatDate } from '../utils/helpers';
import { Edit2, Trash2 } from 'lucide-react';

const RecipeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipe, deleteRecipe, updateRecipe } = useRecipeStore();
  const [recipe, setRecipe] = useState(null);
  const [currentServings, setCurrentServings] = useState(1);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logNotes, setLogNotes] = useState('');

  useEffect(() => {
    const r = getRecipe(id);
    if (r) {
      setRecipe(r);
      setCurrentServings(r.baseServings || 1);
    } else {
      // alert('Ricetta non trovata');
      navigate('/');
    }
  }, [id, getRecipe, navigate]);

  const handleDelete = () => {
    if (window.confirm('Sei sicuro di voler eliminare questa ricetta?')) {
      deleteRecipe(id);
      navigate('/');
    }
  };

  const handleSaveLog = () => {
    if (!recipe) return;
    const newLog = {
      id: Date.now().toString(),
      date: logDate,
      what_changed: logNotes
    };
    const updatedLogs = [newLog, ...(recipe.cookLogs || [])];
    updateRecipe(id, { cookLogs: updatedLogs });
    setRecipe({ ...recipe, cookLogs: updatedLogs });
    setShowLogModal(false);
    setLogNotes('');
  };

  if (!recipe) return <div style={{ padding: '20px', textAlign: 'center' }}>Caricamento...</div>;

  return (
    <>
      <Navigation 
        title="Dettaglio Ricetta" 
        showBack={true} 
        rightActions={
          <>
            <button className="icon-btn" onClick={() => navigate(`/recipe/${id}/edit`)} title="Modifica">
              <Edit2 size={20} />
            </button>
            <button className="icon-btn" onClick={handleDelete} title="Elimina" style={{ color: '#D32F2F' }}>
              <Trash2 size={20} />
            </button>
          </>
        } 
      />

      <div style={{ paddingBottom: '40px' }}>
        {/* Header Info */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ marginBottom: '12px' }}>{recipe.name}</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            <Badge status={recipe.status} />
            <span style={{ fontWeight: '600', color: '#666' }}>
              {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
            </span>
          </div>

          <div className="chips-container">
            {recipe.tools?.map((tool, index) => (
              <Chip key={index} label={tool} isSmall={false} />
            ))}
          </div>
        </div>

        {/* Optional Photo */}
        {recipe.photoUrl && (
          <div style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', maxHeight: '300px' }}>
            <img src={recipe.photoUrl} alt={recipe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Portion Selector Central */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <PortionSelector 
            baseServings={recipe.baseServings} 
            currentServings={currentServings} 
            setCurrentServings={setCurrentServings} 
          />
        </div>

        {/* Ingredients */}
        <section className="card" style={{ marginBottom: '24px', background: '#fffcf7' }}>
          <h2>Ingredienti</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {recipe.ingredients?.map((ing, idx) => {
              const amount = calculateAmount(ing.quantity, recipe.baseServings, currentServings);
              const displayAmount = (amount === 0 || ing.unit === 'q.b.' || !amount) ? '' : amount;
              return (
                <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500' }}>{ing.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
                      {displayAmount} {ing.unit}
                    </span>
                    {ing.note && <div style={{ fontSize: '12px', color: '#777' }}>{ing.note}</div>}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Procedure */}
        <section className="card" style={{ marginBottom: '24px' }}>
          <h2>Procedura</h2>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {recipe.procedure || 'Nessuna procedura inserita.'}
          </div>
        </section>

        {/* Notes */}
        {recipe.notes && (
          <section className="card" style={{ background: '#FFF8E1', borderColor: '#FFE082' }}>
            <h2 style={{ color: '#F57F17' }}>Note & Trucchi</h2>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {recipe.notes}
            </div>
          </section>
        )}

        {/* Links */}
        {recipe.links?.length > 0 && (
          <section className="card" style={{ marginTop: '24px' }}>
            <h2>Link Utili</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {recipe.links.map((link, idx) => (
                <li key={idx} style={{ padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', fontWeight: '600', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                    {link.label || link.url}
                  </a>
                  <AiAnalysisPanel url={link.url} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cook Logs */}
        <section className="card" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Storico Cotture</h2>
            <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '14px' }} onClick={() => setShowLogModal(true)}>
              Ho cucinato oggi
            </button>
          </div>
          
          {recipe.cookLogs?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {recipe.cookLogs.map(log => (
                <li key={log.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    {formatDate(log.date)}
                  </div>
                  <div>{log.what_changed || 'Nessuna modifica/annotazione.'}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#888', fontStyle: 'italic' }}>Non hai ancora cucinato questa ricetta.</p>
          )}
        </section>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '16px' }}>Nuova Cottura</h2>
            <div className="form-group">
              <label>Data</label>
              <input 
                type="date" 
                value={logDate} 
                onChange={e => setLogDate(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Cosa ho cambiato? (opzionale)</label>
              <textarea 
                placeholder="Es. Messo 10g di sale in meno, cotto 5 min in più"
                value={logNotes}
                onChange={e => setLogNotes(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowLogModal(false)}>Annulla</button>
              <button className="btn btn-primary" onClick={handleSaveLog}>Salva</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecipeView;
