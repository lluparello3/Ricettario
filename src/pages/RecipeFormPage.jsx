import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Link2,
  Sparkles,
  ClipboardCheck,
  Clipboard,
  Code,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { AISLES, getAisleForIngredient } from '../utils/aisleHelper';

// Helper: AI JSON parsing and normalization logic with aisle recognition
export const parseRecipeAiJson = (rawText) => {
  if (!rawText || !rawText.trim()) {
    throw new Error('Il testo incollato è vuoto. Inserisci o incolla un JSON generato da AI.');
  }

  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('Il testo fornito non è un JSON valido. Verifica virgolette e virgole.');
  }

  if (Array.isArray(data) && data.length > 0) {
    data = data[0];
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Il JSON non contiene un oggetto ricetta valido.');
  }

  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    throw new Error('Manca il campo obbligatorio "title" (titolo della ricetta).');
  }

  if (!data.ingredients || !Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    throw new Error('Manca l\'array degli ingredienti ("ingredients").');
  }

  if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
    throw new Error('Manca l\'array dei passaggi ("steps").');
  }

  // Normalize ingredients with aisle
  const normalizedIngredients = data.ingredients.map((ing) => {
    if (typeof ing === 'string') {
      const name = ing.trim();
      return {
        id: crypto.randomUUID(),
        name,
        amount: null,
        unit: '',
        isScalable: true,
        aisle: getAisleForIngredient(name, null)
      };
    }
    const name = ing.name ? String(ing.name).trim() : 'Ingrediente';
    return {
      id: crypto.randomUUID(),
      name,
      amount: ing.amount != null && !isNaN(ing.amount) ? Number(ing.amount) : null,
      unit: ing.unit ? String(ing.unit).trim() : '',
      isScalable: ing.isScalable !== false,
      aisle: getAisleForIngredient(name, ing.aisle)
    };
  });

  // Normalize steps
  const normalizedSteps = data.steps.map((s, idx) => {
    if (typeof s === 'string') {
      return {
        stepNumber: idx + 1,
        instruction: s.trim()
      };
    }
    return {
      stepNumber: s.stepNumber || idx + 1,
      instruction: s.instruction ? String(s.instruction).trim() : ''
    };
  });

  // Normalize tags
  let tagsString = '';
  if (Array.isArray(data.tags)) {
    tagsString = data.tags.join(', ');
  } else if (typeof data.tags === 'string') {
    tagsString = data.tags;
  }

  return {
    title: data.title.trim(),
    imageUrl: data.imageUrl ? String(data.imageUrl).trim() : '',
    servings: Number(data.servings) || 4,
    category: data.category ? String(data.category).trim() : 'Primo',
    cuisine: data.cuisine ? String(data.cuisine).trim() : 'Italiana',
    difficulty: data.difficulty ? String(data.difficulty).trim() : 'Media',
    prepTimeMinutes: Number(data.prepTimeMinutes) || 15,
    cookTimeMinutes: Number(data.cookTimeMinutes) || 20,
    mainIngredient: data.mainIngredient ? String(data.mainIngredient).trim() : '',
    tagsString,
    notes: data.notes ? String(data.notes).trim() : '',
    linkedRecipeIds: Array.isArray(data.linkedRecipeIds) ? data.linkedRecipeIds : [],
    ingredients: normalizedIngredients,
    steps: normalizedSteps
  };
};

export const RecipeFormPage = ({ recipes = [], onSaveRecipe }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const existingRecipe = useMemo(() => {
    return isEditing ? recipes.find((r) => r.id === id) : null;
  }, [recipes, id, isEditing]);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    servings: 4,
    category: 'Primo',
    cuisine: 'Italiana',
    difficulty: 'Media',
    prepTimeMinutes: 20,
    cookTimeMinutes: 30,
    mainIngredient: '',
    tagsString: '',
    notes: '',
    linkedRecipeIds: [],
    ingredients: [
      { id: crypto.randomUUID(), name: '', amount: '', unit: '', isScalable: true, aisle: 'Dispensa' }
    ],
    steps: [{ stepNumber: 1, instruction: '' }]
  });

  const [activeIngredientIndex, setActiveIngredientIndex] = useState(null);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [error, setError] = useState('');

  // AI Import Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiJsonInput, setAiJsonInput] = useState('');
  const [aiModalError, setAiModalError] = useState('');
  const [copiedPromptSuccess, setCopiedPromptSuccess] = useState(false);

  // Extract all unique existing ingredient names across all recipes for autocomplete
  const knownIngredientNames = useMemo(() => {
    const set = new Set();
    recipes.forEach((r) => {
      (r.ingredients || []).forEach((ing) => {
        if (ing.name && ing.name.trim()) {
          set.add(ing.name.trim());
        }
      });
    });
    return Array.from(set);
  }, [recipes]);

  // Load existing recipe data if editing
  useEffect(() => {
    if (existingRecipe) {
      setFormData({
        title: existingRecipe.title || '',
        imageUrl: existingRecipe.imageUrl || '',
        servings: existingRecipe.servings || 4,
        category: existingRecipe.category || 'Primo',
        cuisine: existingRecipe.cuisine || 'Italiana',
        difficulty: existingRecipe.difficulty || 'Media',
        prepTimeMinutes: existingRecipe.prepTimeMinutes || 0,
        cookTimeMinutes: existingRecipe.cookTimeMinutes || 0,
        mainIngredient: existingRecipe.mainIngredient || '',
        tagsString: (existingRecipe.tags || []).join(', '),
        notes: existingRecipe.notes || '',
        linkedRecipeIds: existingRecipe.linkedRecipeIds || [],
        ingredients:
          existingRecipe.ingredients && existingRecipe.ingredients.length > 0
            ? existingRecipe.ingredients.map((ing) => ({
                ...ing,
                id: ing.id || crypto.randomUUID(),
                aisle: getAisleForIngredient(ing.name, ing.aisle)
              }))
            : [{ id: crypto.randomUUID(), name: '', amount: '', unit: '', isScalable: true, aisle: 'Dispensa' }],
        steps:
          existingRecipe.steps && existingRecipe.steps.length > 0
            ? existingRecipe.steps
            : [{ stepNumber: 1, instruction: '' }]
      });
    }
  }, [existingRecipe]);

  const categories = [
    'Antipasto',
    'Primo',
    'Piatto Unico',
    'Carne',
    'Pesce',
    'Contorno',
    'Dolce',
    'Altro',
    'Preparazione base'
  ];

  const cuisines = [
    'Italiana',
    'Emiliana',
    'Toscana',
    'Siciliana',
    'Romana',
    'Napoletana',
    'Francese',
    'Internazionale'
  ];

  // Ingredients handlers
  const handleIngredientChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.ingredients];
      const current = { ...updated[index], [field]: value };

      // Auto-assign aisle when typing ingredient name if not manually set
      if (field === 'name') {
        current.aisle = getAisleForIngredient(value, current.aisle);
      }

      updated[index] = current;
      return { ...prev, ingredients: updated };
    });

    if (field === 'name') {
      setActiveIngredientIndex(index);
      setIngredientSearch(value);
    }
  };

  const selectSuggestedIngredient = (index, name) => {
    handleIngredientChange(index, 'name', name);
    setActiveIngredientIndex(null);
  };

  const addIngredientRow = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { id: crypto.randomUUID(), name: '', amount: '', unit: '', isScalable: true, aisle: 'Dispensa' }
      ]
    }));
  };

  const removeIngredientRow = (index) => {
    if (formData.ingredients.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  // Steps handlers
  const handleStepChange = (index, instruction) => {
    setFormData((prev) => {
      const updated = [...prev.steps];
      updated[index] = { ...updated[index], instruction };
      return { ...prev, steps: updated };
    });
  };

  const addStepRow = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        { stepNumber: prev.steps.length + 1, instruction: '' }
      ]
    }));
  };

  const removeStepRow = (index) => {
    if (formData.steps.length === 1) return;
    setFormData((prev) => {
      const filtered = prev.steps.filter((_, i) => i !== index);
      const renumbered = filtered.map((s, idx) => ({
        ...s,
        stepNumber: idx + 1
      }));
      return { ...prev, steps: renumbered };
    });
  };

  // Linked Base Recipes Handler
  const toggleLinkedRecipe = (recipeId) => {
    setFormData((prev) => {
      const current = prev.linkedRecipeIds || [];
      const updated = current.includes(recipeId)
        ? current.filter((id) => id !== recipeId)
        : [...current, recipeId];
      return { ...prev, linkedRecipeIds: updated };
    });
  };

  // AI Clipboard Reader
  const handleReadClipboard = async () => {
    setAiModalError('');
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setAiJsonInput(text);
        } else {
          setAiModalError('Gli appunti sono vuoti. Incolla manualmente nella casella di testo.');
        }
      } else {
        setAiModalError('Accesso alla clipboard non supportato dal browser. Incolla con CTRL+V / Tap prolungato.');
      }
    } catch (err) {
      setAiModalError('Permesso per accedere agli appunti negato. Incolla manualmente nella casella di testo.');
    }
  };

  // AI Validation & Form Population
  const handleValidateAndPopulate = () => {
    setAiModalError('');
    try {
      const parsedData = parseRecipeAiJson(aiJsonInput);
      setFormData(parsedData);
      setIsAiModalOpen(false);
      setAiJsonInput('');
    } catch (err) {
      setAiModalError(err.message);
    }
  };

  // Copy AI Prompt Template to Clipboard
  const handleCopyAiPromptTemplate = async () => {
    const promptTemplate = `Genera una ricetta in formato JSON rigoroso per l'app Ricettario con la seguente struttura:
{
  "title": "Nome Ricetta",
  "imageUrl": "https://...",
  "servings": 4,
  "category": "Primo",
  "cuisine": "Italiana",
  "difficulty": "Facile",
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 20,
  "mainIngredient": "Ingrediente principale",
  "tags": ["Tag1", "Tag2"],
  "notes": "Note utili...",
  "ingredients": [
    { "name": "Ingrediente 1", "amount": 300, "unit": "g", "isScalable": true, "aisle": "Dispensa" }
  ],
  "steps": [
    { "stepNumber": 1, "instruction": "Passaggio 1..." }
  ]
}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(promptTemplate);
      setCopiedPromptSuccess(true);
      setTimeout(() => setCopiedPromptSuccess(false), 2500);
    }
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Inserisci un titolo per la ricetta.');
      return;
    }

    const normTitle = formData.title.trim().toLowerCase();
    const isDuplicate = recipes.some(
      (r) => r.id !== id && r.title.trim().toLowerCase() === normTitle
    );
    if (isDuplicate) {
      setError('Esiste già una ricetta con questo titolo esatto. Scegli un titolo univoco.');
      return;
    }

    const cleanIngredients = formData.ingredients
      .filter((ing) => ing.name && ing.name.trim())
      .map((ing) => ({
        ...ing,
        name: ing.name.trim(),
        amount: ing.amount !== '' && !isNaN(ing.amount) ? Number(ing.amount) : null,
        unit: ing.unit ? ing.unit.trim() : '',
        aisle: getAisleForIngredient(ing.name, ing.aisle)
      }));

    const cleanSteps = formData.steps
      .filter((s) => s.instruction && s.instruction.trim())
      .map((s, idx) => ({
        stepNumber: idx + 1,
        instruction: s.instruction.trim()
      }));

    const parsedTags = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const recipePayload = {
      ...(existingRecipe || {}),
      id: id || crypto.randomUUID(),
      title: formData.title.trim(),
      imageUrl: formData.imageUrl.trim() || null,
      servings: Number(formData.servings) || 4,
      category: formData.category,
      cuisine: formData.cuisine,
      difficulty: formData.difficulty,
      prepTimeMinutes: Number(formData.prepTimeMinutes) || 0,
      cookTimeMinutes: Number(formData.cookTimeMinutes) || 0,
      mainIngredient: formData.mainIngredient.trim(),
      tags: parsedTags,
      notes: formData.notes.trim(),
      linkedRecipeIds: formData.linkedRecipeIds,
      ingredients: cleanIngredients,
      steps: cleanSteps
    };

    onSaveRecipe(recipePayload);
    navigate(`/recipes/${recipePayload.id}`);
  };

  // Filter autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!ingredientSearch || ingredientSearch.trim().length < 2) return [];
    const q = ingredientSearch.toLowerCase();
    return knownIngredientNames.filter((name) =>
      name.toLowerCase().includes(q)
    );
  }, [ingredientSearch, knownIngredientNames]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with Quick AI Import Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Annulla
        </button>

        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          {isEditing ? 'Modifica Ricetta' : 'Nuova Ricetta'}
        </h1>

        {/* AI Quick Import Trigger Button */}
        <Button
          variant="terracotta"
          size="sm"
          onClick={() => setIsAiModalOpen(true)}
          icon={Sparkles}
        >
          Incolla da Appunti (AI)
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Details Section */}
        <section className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-serif font-bold text-stone-800 border-b border-stone-100 pb-2">
            Informazioni Generali
          </h2>

          <Input
            label="Titolo Ricetta *"
            placeholder="Es. Tagliatelle al Ragù Tradizionale..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="URL Immagine Esterna (opzionale)"
            placeholder="https://images.unsplash.com/photo-..."
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-xl text-stone-800 px-3 py-2.5 text-sm min-h-[44px]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Cucina / Regione
              </label>
              <select
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-xl text-stone-800 px-3 py-2.5 text-sm min-h-[44px]"
              >
                {cuisines.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Difficoltà
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-xl text-stone-800 px-3 py-2.5 text-sm min-h-[44px]"
              >
                <option value="Facile">Facile</option>
                <option value="Media">Media</option>
                <option value="Difficile">Difficile</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Porzioni Base"
              type="number"
              min="1"
              max="50"
              value={formData.servings}
              onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
            />

            <Input
              label="Tempo Prep. (minuti)"
              type="number"
              min="0"
              value={formData.prepTimeMinutes}
              onChange={(e) => setFormData({ ...formData, prepTimeMinutes: e.target.value })}
            />

            <Input
              label="Tempo Cottura (minuti)"
              type="number"
              min="0"
              value={formData.cookTimeMinutes}
              onChange={(e) => setFormData({ ...formData, cookTimeMinutes: e.target.value })}
            />
          </div>

          <Input
            label="Ingrediente Principale"
            placeholder="Es. Carne macinata, Mascarpone, Farina..."
            value={formData.mainIngredient}
            onChange={(e) => setFormData({ ...formData, mainIngredient: e.target.value })}
          />

          <Input
            label="Tag (separati da virgola)"
            placeholder="Es. Pasta, Tradizione, Domenica, Senza Cottura"
            value={formData.tagsString}
            onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
          />
        </section>

        {/* Linked Base Recipes Section */}
        <section className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h2 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-amber-600" /> Collega Preparazioni Base
            </h2>
            <span className="text-xs text-stone-400 font-medium">Seleziona basi collegate</span>
          </div>

          <p className="text-xs text-stone-500">
            Se questa ricetta necessita di una base riutilizzabile (es. "Pasta fresca all'uovo base"), collegala qui per facilitarne il conteggio nella spesa.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {recipes
              .filter((r) => r.id !== id)
              .map((r) => {
                const isLinked = (formData.linkedRecipeIds || []).includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleLinkedRecipe(r.id)}
                    className={`
                      px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5
                      ${
                        isLinked
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                      }
                    `}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>{r.title}</span>
                  </button>
                );
              })}
          </div>
        </section>

        {/* Ingredients Section with Autocomplete and Aisle Selection */}
        <section className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h2 className="text-lg font-serif font-bold text-stone-800">
              Ingredienti
            </h2>
            <Button variant="secondary" size="sm" onClick={addIngredientRow} icon={Plus}>
              Aggiungi Ingrediente
            </Button>
          </div>

          <div className="space-y-3">
            {formData.ingredients.map((ing, index) => (
              <div
                key={ing.id || index}
                className="relative bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60 space-y-2.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  {/* Ingredient Name Input with Autocomplete */}
                  <div className="sm:col-span-4 relative">
                    <input
                      type="text"
                      placeholder="Nome Ingrediente *"
                      value={ing.name}
                      onFocus={() => {
                        setActiveIngredientIndex(index);
                        setIngredientSearch(ing.name);
                      }}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />

                    {/* Autocomplete Suggestions Dropdown */}
                    {activeIngredientIndex === index && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                        {suggestions.map((sugg) => (
                          <button
                            key={sugg}
                            type="button"
                            onClick={() => selectSuggestedIngredient(index, sugg)}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-900 border-b border-stone-100 last:border-0"
                          >
                            {sugg}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Quantità"
                      value={ing.amount !== null ? ing.amount : ''}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Unit */}
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Unità (es. g, ml)"
                      value={ing.unit || ''}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Aisle Selection Dropdown */}
                  <div className="sm:col-span-3">
                    <select
                      value={ing.aisle || getAisleForIngredient(ing.name, null)}
                      onChange={(e) => handleIngredientChange(index, 'aisle', e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {AISLES.map((a) => (
                        <option key={a.key} value={a.key}>
                          {a.icon} {a.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Remove Button */}
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeIngredientRow(index)}
                      disabled={formData.ingredients.length === 1}
                      className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Scalable Toggle */}
                <div className="flex items-center gap-2 pt-0.5 text-xs text-stone-600">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={ing.isScalable !== false}
                      onChange={(e) =>
                        handleIngredientChange(index, 'isScalable', e.target.checked)
                      }
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                    />
                    <span>Scalabile con le porzioni</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Steps Section */}
        <section className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h2 className="text-lg font-serif font-bold text-stone-800">
              Procedimento Passo-Passo
            </h2>
            <Button variant="secondary" size="sm" onClick={addStepRow} icon={Plus}>
              Aggiungi Passaggio
            </Button>
          </div>

          <p className="text-xs text-stone-500">
            Trattino tip: puoi citare altre ricette collegate scrivendo <strong>@NomeRicetta</strong> (es. @Pasta fresca all'uovo base) per generare un link automatico!
          </p>

          <div className="space-y-3">
            {formData.steps.map((step, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-2">
                  {step.stepNumber}
                </div>

                <div className="flex-1">
                  <textarea
                    placeholder={`Passaggio ${step.stepNumber}...`}
                    value={step.instruction}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl p-3 text-sm text-stone-800 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeStepRow(index)}
                  disabled={formData.steps.length === 1}
                  className="text-stone-400 hover:text-red-600 p-2 rounded-lg disabled:opacity-30 mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <h2 className="text-lg font-serif font-bold text-stone-800 border-b border-stone-100 pb-2">
            Note & Consigli del Cuoco
          </h2>
          <textarea
            placeholder="Consigli sulla cottura, varianti o trucchi della nonna..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-white border border-stone-300 rounded-xl p-3 text-sm text-stone-800 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </section>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>
            Annulla
          </Button>
          <Button variant="primary" size="lg" type="submit" icon={Save}>
            Salva Ricetta
          </Button>
        </div>
      </form>

      {/* AI Quick Import Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setAiModalError('');
        }}
        title="Importa Ricetta da Testo / AI (JSON)"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Incolla qui il codice JSON generato da un’intelligenza artificiale (ChatGPT, Gemini, Claude, ecc.). L’app compilerà automaticamente tutti i campi del form (inclusi i reparti del supermercato per ogni ingrediente).
            </div>
          </div>

          {aiModalError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{aiModalError}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Codice JSON Ricetta
              </label>
              <button
                type="button"
                onClick={handleReadClipboard}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline"
              >
                <Clipboard className="w-3.5 h-3.5" /> Incolla dagli Appunti
              </button>
            </div>
            <textarea
              placeholder={`Incolla qui il JSON ricetta, es:\n{\n  "title": "Risotto ai Funghi",\n  "servings": 4,\n  "category": "Primo",\n  "ingredients": [{ "name": "Riso", "amount": 300, "unit": "g", "aisle": "Dispensa" }],\n  "steps": [{ "stepNumber": 1, "instruction": "Tostare il riso..." }]\n}`}
              value={aiJsonInput}
              onChange={(e) => setAiJsonInput(e.target.value)}
              className="w-full bg-stone-900 text-amber-200 font-mono text-xs p-3.5 rounded-2xl min-h-[180px] focus:outline-none focus:ring-2 focus:ring-amber-500 border border-stone-800"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={handleCopyAiPromptTemplate}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 hover:underline"
            >
              {copiedPromptSuccess ? (
                <>
                  <ClipboardCheck className="w-4 h-4 text-emerald-600" /> Esempio Prompt Copiato!
                </>
              ) : (
                <>
                  <Code className="w-4 h-4 text-stone-400" /> Copia Esempio Prompt per AI
                </>
              )}
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsAiModalOpen(false);
                  setAiModalError('');
                }}
              >
                Annulla
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleValidateAndPopulate}
                icon={Sparkles}
                disabled={!aiJsonInput.trim()}
              >
                Valida e Compila Form
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
