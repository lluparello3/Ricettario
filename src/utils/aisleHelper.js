/**
 * Supermarket Aisle Helper & Automatic Ingredient Department Classifier
 */

export const AISLES = [
  { key: 'Ortofrutta', label: 'Ortofrutta', icon: '🥬', color: 'emerald' },
  { key: 'Banco Frigo', label: 'Banco Frigo', icon: '🧀', color: 'amber' },
  { key: 'Macelleria', label: 'Macelleria', icon: '🥩', color: 'rose' },
  { key: 'Pescheria', label: 'Pescheria', icon: '🐟', color: 'sky' },
  { key: 'Dispensa', label: 'Dispensa (Secco & Conserve)', icon: '🥫', color: 'orange' },
  { key: 'Spezie e Condimenti', label: 'Spezie e Condimenti', icon: '🧂', color: 'stone' },
  { key: 'Altro', label: 'Altro / Varie', icon: '📦', color: 'slate' }
];

const AISLE_KEYWORDS = {
  Ortofrutta: [
    'cipolla', 'cipolle', 'carota', 'carote', 'sedano', 'pomodoro', 'pomodori', 'limone', 'limoni', 'aglio', 'basilico', 'prezzemolo',
    'patata', 'patate', 'mela', 'mele', 'zucchina', 'zucchine', 'melanzana', 'melanzane',
    'insalata', 'spinaci', 'fungo', 'funghi', 'porcini', 'scallogno', 'porro', 'zucca',
    'arancia', 'arance', 'fragola', 'fragole', 'avocado', 'peperone', 'peperoni', 'erba cipollina'
  ],
  'Banco Frigo': [
    'latte', 'uova', 'uovo', 'burro', 'mascarpone', 'parmigiano', 'mozzarella', 'ricotta',
    'panna', 'formaggio', 'gorgonzola', 'pecorino', 'grana', 'stracchino', 'yogurt',
    'provola', 'fontina', 'scamorza', 'robiola', 'emmental', 'edam', 'panna fresca'
  ],
  Macelleria: [
    'macinato', 'manzo', 'maiale', 'pancetta', 'petto di pollo', 'pollo', 'salsiccia',
    'carne', 'prosciutto', 'speck', 'guanciale', 'vitello', 'tacchino', 'lonza', 'costine',
    'agnello', 'mortadella', 'salame', 'bresaola', 'wuerstel'
  ],
  Pescheria: [
    'salmone', 'tonno', 'gamberi', 'gamberetti', 'branzino', 'orata', 'pesce', 'vongole',
    'cozze', 'calamari', 'seppie', 'polpo', 'merluzzo', 'spada', 'pesce spada', 'alici', 'sarde'
  ],
  Dispensa: [
    'farina', 'riso', 'savoiardi', 'zucchero', 'caffè', 'caffe', 'passata', 'pasta',
    'tagliatelle', 'spaghetti', 'penne', 'rigatoni', 'fusilli', 'pane', 'lievito',
    'cacao', 'biscotti', 'cioccolato', 'miele', 'marmellata', 'nocciole', 'mandorle',
    'pinoli', 'pangrattato', 'pelati', 'concentrato', 'tonno in scatola', 'fagioli', 'ceci'
  ],
  'Spezie e Condimenti': [
    'olio', 'sale', 'pepe', 'vino', 'aceto', 'origano', 'rosmarino', 'noce moscata',
    'peperoncino', 'cannella', 'chiodi di garofano', 'alloro', 'timo', 'salvia',
    'maionese', 'senape', 'ketchup', 'salsa di soia', 'brodo', 'dado'
  ]
};

export const getAisleForIngredient = (ingredientName = '', existingAisle = null) => {
  if (existingAisle && AISLES.some((a) => a.key === existingAisle)) {
    return existingAisle;
  }

  const norm = (ingredientName || '').toLowerCase().trim();
  if (!norm) return 'Altro';

  for (const [aisleKey, keywords] of Object.entries(AISLE_KEYWORDS)) {
    if (keywords.some((kw) => norm.includes(kw))) {
      return aisleKey;
    }
  }

  return 'Altro';
};
