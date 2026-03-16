export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Calculate proportional amount based on servings
export const calculateAmount = (amount, baseServings, currentServings) => {
  if (!amount || isNaN(amount)) return amount;
  return Number(((amount / baseServings) * currentServings).toFixed(1));
};

export const RECIPE_CATEGORIES = [
  { value: 'primo', label: 'Primo' },
  { value: 'secondo', label: 'Secondo' },
  { value: 'dolce', label: 'Dolce' },
  { value: 'altro', label: 'Altro' }
];

export const RECIPE_STATUSES = [
  { value: 'collaudata', label: 'Collaudata' },
  { value: 'in_sviluppo', label: 'In sviluppo' },
  { value: 'da_provare', label: 'Da provare' },
  { value: 'abbandonata', label: 'Abbandonata' }
];

export const RECIPE_TOOLS = [
  'Bimby', 'Friggitrice ad aria', 'Forno', 'Padella', 'Pentola', 'Altro'
];

export const UNIT_OPTIONS = [
  'g', 'ml', 'cucchiai', 'pz', 'q.b.'
];
