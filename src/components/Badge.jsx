import React from 'react';

const Badge = ({ status }) => {
  const getBadgeClass = (status) => {
    switch (status) {
      case 'collaudata': return 'badge-collaudata';
      case 'in_sviluppo': return 'badge-in_sviluppo';
      case 'da_provare': return 'badge-da_provare';
      case 'abbandonata': return 'badge-abbandonata';
      default: return 'badge-abbandonata';
    }
  };

  const statusLabels = {
    'collaudata': 'Collaudata',
    'in_sviluppo': 'In sviluppo',
    'da_provare': 'Da provare',
    'abbandonata': 'Abbandonata'
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      {statusLabels[status] || status}
    </span>
  );
};

export default Badge;
