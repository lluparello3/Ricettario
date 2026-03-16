import React, { useState } from 'react';
import { analyzeRecipeLink } from '../services/ai';

const AiAnalysisPanel = ({ url }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (isOpen && result) {
      setIsOpen(false);
      return;
    }
    
    setIsOpen(true);
    if (!result) {
      setLoading(true);
      setError(null);
      try {
        const data = await analyzeRecipeLink(url);
        // Extract JSON from Claude response
        // Usually Claude returns text that might contain markdown JSON, we just stringify the raw response for now
        // or try to parse it if we can.
        setResult(JSON.stringify(data, null, 2));
      } catch (err) {
        setError(err.message || 'Errore durante l\'analisi (probabile CORS o API key mancante).');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ marginTop: '8px', marginBottom: '16px' }}>
      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '14px' }} onClick={handleAnalyze}>
        {isOpen ? 'Chiudi Analisi' : 'Analizza con AI'}
      </button>

      {isOpen && (
        <div style={{ marginTop: '12px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef', fontSize: '14px' }}>
          {loading && <p>Analisi in corso tramite Claude AI...</p>}
          {error && <p style={{ color: '#D32F2F' }}>{error}</p>}
          {result && (
             <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '12px', background: '#333', color: '#fff', padding: '12px', borderRadius: '4px' }}>
               {result}
             </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default AiAnalysisPanel;
