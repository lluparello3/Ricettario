import React from 'react';

const Chip = ({ label, isSmall = false, active = false, onClick, onRemove }) => {
  const baseClass = isSmall ? 'chip-small' : 'chip';
  const activeClass = active ? 'active' : '';

  return (
    <button 
      type="button" 
      className={`${baseClass} ${activeClass}`} 
      onClick={onClick}
    >
      {label}
      {onRemove && (
        <span 
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ marginLeft: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          &times;
        </span>
      )}
    </button>
  );
};

export default Chip;
