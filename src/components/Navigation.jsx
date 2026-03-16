import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Settings, Home, Plus } from 'lucide-react';

const Navigation = ({ title, showBack = false, rightActions = null }) => {
  const navigate = useNavigate();

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showBack && (
            <button className="icon-btn" onClick={() => navigate(-1)}>
              <span style={{ fontSize: '24px' }}>&larr;</span>
            </button>
          )}
          <h2>{title}</h2>
        </div>
        <div className="topbar-actions">
          {rightActions}
          {!rightActions && !showBack && (
            <>
              <button className="icon-btn" onClick={() => navigate('/search')} title="Cerca per ingrediente">
                <Search size={20} />
              </button>
              <button className="icon-btn" onClick={() => navigate('/settings')} title="Impostazioni">
                <Settings size={20} />
              </button>
            </>
          )}
        </div>
      </header>
    </>
  );
};

export default Navigation;
