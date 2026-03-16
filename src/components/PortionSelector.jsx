import React from 'react';

const PortionSelector = ({ baseServings, currentServings, setCurrentServings }) => {
  const decrease = () => {
    if (currentServings > 1) setCurrentServings(currentServings - 1);
  };
  
  const increase = () => {
    setCurrentServings(currentServings + 1);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0', background: 'white', padding: '12px 24px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', alignSelf: 'center', width: 'fit-content' }}>
      <button 
        onClick={decrease} 
        disabled={currentServings <= 1}
        style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: currentServings <= 1 ? '#f0f0f0' : '#FFEBEE', color: currentServings <= 1 ? '#999' : '#D32F2F', fontSize: '24px', cursor: currentServings <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        -
      </button>
      
      <div style={{ textAlign: 'center', minWidth: '80px' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-color)' }}>{currentServings}</div>
        <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Porzioni</div>
      </div>

      <button 
        onClick={increase}
        style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#E8F5E9', color: '#2E7D32', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        +
      </button>
    </div>
  );
};

export default PortionSelector;
