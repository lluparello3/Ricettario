export const INITIAL_RECIPES = [
  {
    id: "rec-base-pasta-001",
    title: "Pasta fresca all'uovo base",
    imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80",
    servings: 4,
    category: "Preparazione base",
    cuisine: "Italiana",
    difficulty: "Facile",
    prepTimeMinutes: 25,
    cookTimeMinutes: 5,
    mainIngredient: "Farina 00",
    tags: ["Base", "Pasta", "Fatto in casa", "Tradizione"],
    notes: "Utilizzare uova a temperatura ambiente. Calcolare 1 uovo ogni 100g di farina.",
    linkedRecipeIds: [],
    ingredients: [
      { id: "ing-1", name: "Farina 00", amount: 400, unit: "g", isScalable: true, aisle: "Dispensa" },
      { id: "ing-2", name: "Uova medie", amount: 4, unit: "pz", isScalable: true, aisle: "Banco Frigo" },
      { id: "ing-3", name: "Sale fino", amount: 1, unit: "pizzico", isScalable: false, aisle: "Spezie e Condimenti" },
      { id: "ing-4", name: "Olio extravergine di oliva", amount: 1, unit: "cucchiaio", isScalable: false, aisle: "Spezie e Condimenti" }
    ],
    steps: [
      { stepNumber: 1, instruction: "Versare la farina a fontana su una spianatoia in legno e ricavare una capiente fossetta al centro." },
      { stepNumber: 2, instruction: "Rompere le uova al centro della fontana, unire un pizzico di sale e l'olio d'oliva." },
      { stepNumber: 3, instruction: "Sbattere leggermente le uova con una forchetta ed iniziare ad incorporare la farina dai bordi." },
      { stepNumber: 4, instruction: "Impastare vigorosamente a mano per circa 10-15 minuti fino ad ottenere un panetto liscio, omogeneo ed elastico." },
      { stepNumber: 5, instruction: "Avvolgere l'impasto nella pellicola trasparente e lasciarlo riposare a temperatura ambiente per almeno 30 minuti prima di stenderlo." }
    ]
  },
  {
    id: "rec-ragu-002",
    title: "Tagliatelle al Ragù Tradizionale",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3d5d6281293?auto=format&fit=crop&w=1000&q=80",
    servings: 4,
    category: "Primo",
    cuisine: "Emiliana",
    difficulty: "Media",
    prepTimeMinutes: 30,
    cookTimeMinutes: 120,
    mainIngredient: "Macinato misto",
    tags: ["Ragù", "Bolognese", "Pranzo della Domenica", "Pasta Fresca"],
    notes: "Per un ragù eccellente, la cottura deve avvenire a fuoco lentissimo (pippare) per almeno 2 ore.",
    linkedRecipeIds: ["rec-base-pasta-001"],
    ingredients: [
      { id: "ing-5", name: "Tagliatelle fresche", amount: 400, unit: "g", isScalable: true, aisle: "Dispensa" },
      { id: "ing-6", name: "Carne bovina macinata", amount: 300, unit: "g", isScalable: true, aisle: "Macelleria" },
      { id: "ing-7", name: "Pancetta fresca di maiale", amount: 150, unit: "g", isScalable: true, aisle: "Macelleria" },
      { id: "ing-8", name: "Passata di pomodoro", amount: 300, unit: "g", isScalable: true, aisle: "Dispensa" },
      { id: "ing-9", name: "Cipolla dorata", amount: 1, unit: "pz", isScalable: true, aisle: "Ortofrutta" },
      { id: "ing-10", name: "Carota", amount: 1, unit: "pz", isScalable: true, aisle: "Ortofrutta" },
      { id: "ing-11", name: "Costa di sedano", amount: 1, unit: "pz", isScalable: true, aisle: "Ortofrutta" },
      { id: "ing-12", name: "Vino bianco secco", amount: 100, unit: "ml", isScalable: true, aisle: "Spezie e Condimenti" },
      { id: "ing-13", name: "Latte intero", amount: 100, unit: "ml", isScalable: true, aisle: "Banco Frigo" },
      { id: "ing-14", name: "Brodo vegetale", amount: 200, unit: "ml", isScalable: true, aisle: "Spezie e Condimenti" },
      { id: "ing-15", name: "Olio extravergine d'oliva", amount: 2, unit: "cucchiai", isScalable: false, aisle: "Spezie e Condimenti" },
      { id: "ing-16", name: "Sale e pepe nero", amount: null, unit: "q.b.", isScalable: false, aisle: "Spezie e Condimenti" }
    ],
    steps: [
      { stepNumber: 1, instruction: "Preparare la sfoglia per le tagliatelle seguendo la ricetta @Pasta fresca all'uovo base." },
      { stepNumber: 2, instruction: "Tritare finemente il sedano, la carota e la cipolla. Tritare a coltello la pancetta di maiale." },
      { stepNumber: 3, instruction: "In una casseruola di terracotta o ghisa, far rosolare la pancetta con l'olio d'oliva e il soffritto di verdure." },
      { stepNumber: 4, instruction: "Aggiungere la carne macinata di manzo e mescolare continuamente sgranandola bene finché non prende colore." },
      { stepNumber: 5, instruction: "Versare il vino bianco e lasciar evaporare completamente a fiamma viva." },
      { stepNumber: 6, instruction: "Unire la passata di pomodoro e il brodo bollente. Coprire e lasciar cuocere a fuoco bassissimo per circa 2 ore." },
      { stepNumber: 7, instruction: "Verso fine cottura aggiungere il latte per smorzare l'acidità e regolare di sale e pepe." },
      { stepNumber: 8, instruction: "Cuocere le tagliatelle in abbondante acqua salata, scolarle al dente e mantecarle direttamente nel ragù bollente." }
    ]
  },
  {
    id: "rec-tiramisu-003",
    title: "Tiramisù della Casa",
    imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=1000&q=80",
    servings: 6,
    category: "Dolce",
    cuisine: "Italiana",
    difficulty: "Facile",
    prepTimeMinutes: 25,
    cookTimeMinutes: 0,
    mainIngredient: "Mascarpone",
    tags: ["Dolci", "Senza cottura", "Caffè", "Cucchiaiaro"],
    notes: "Assicurati di usare uova freschissime da allevamento biologico.",
    linkedRecipeIds: [],
    ingredients: [
      { id: "ing-17", name: "Mascarpone fresco", amount: 500, unit: "g", isScalable: true, aisle: "Banco Frigo" },
      { id: "ing-18", name: "Savoiardi", amount: 300, unit: "g", isScalable: true, aisle: "Dispensa" },
      { id: "ing-19", name: "Uova freschissime", amount: 4, unit: "pz", isScalable: true, aisle: "Banco Frigo" },
      { id: "ing-20", name: "Zucchero semolato", amount: 100, unit: "g", isScalable: true, aisle: "Dispensa" },
      { id: "ing-21", name: "Caffè espresso zuccherato", amount: 300, unit: "ml", isScalable: true, aisle: "Dispensa" },
      { id: "ing-22", name: "Cacao amaro in polvere", amount: 30, unit: "g", isScalable: false, aisle: "Dispensa" }
    ],
    steps: [
      { stepNumber: 1, instruction: "Separare i tuorli dagli albumi in due ciotole capienti." },
      { stepNumber: 2, instruction: "Montare i tuorli con lo zucchero usando le fruste elettriche fino a ottenere un composto chiaro e spumoso." },
      { stepNumber: 3, instruction: "Aggiungere il mascarpone un po' alla volta, incorporandolo delicatamente ai tuorli." },
      { stepNumber: 4, instruction: "Montare gli albumi a neve fermissima e unirli al composto di mascarpone con movimenti dal basso verso l'alto." },
      { stepNumber: 5, instruction: "Inzuppare rapidamente i savoiardi nel caffè freddo/tiepido e disporli in una pirofila a formare il primo strato." },
      { stepNumber: 6, instruction: "Stendere metà della crema al mascarpone sui savoiardi, creare un secondo strato di savoiardi e coprire con la crema rimanente." },
      { stepNumber: 7, instruction: "Riporre in frigorifero per almeno 3 ore. Prima di servire, spolverizzare generosamente con cacao amaro in polvere." }
    ]
  }
];
