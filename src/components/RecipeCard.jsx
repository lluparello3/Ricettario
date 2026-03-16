import React from 'react';
import Badge from './Badge';
import Chip from './Chip';
import { useNavigate } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();

  return (
    <div className="card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', flex: 1 }}>{recipe.name}</h3>
        <Badge status={recipe.status} />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', color: '#666', fontWeight: 'w500' }}>
          {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
        </span>
      </div>

      <div className="chips-container" style={{ marginBottom: 0 }}>
        {recipe.tools?.map((tool, index) => (
          <Chip key={index} label={tool} isSmall={true} />
        ))}
      </div>
    </div>
  );
};

export default RecipeCard;
