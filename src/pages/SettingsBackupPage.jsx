import React, { useState } from 'react';
import { exportAppData, mergeRecipesByTitle } from '../utils/backupHelper';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  HardDrive,
  Info
} from 'lucide-react';

export const SettingsBackupPage = ({
  recipes = [],
  shoppingList = [],
  appConfig = {},
  onImportRecipes,
  onResetSampleData
}) => {
  const [importSummary, setImportSummary] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Handle JSON Export
  const handleExport = () => {
    exportAppData(recipes, shoppingList, appConfig);
  };

  // Handle JSON Import
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && Array.isArray(parsed.recipes)) {
          const { mergedList, summary } = mergeRecipesByTitle(recipes, parsed.recipes);
          onImportRecipes(mergedList);
          setImportSummary(summary);
        } else {
          alert('Formato file JSON non valido. Impossibile trovare l\'array "recipes".');
        }
      } catch (err) {
        alert('Errore nella lettura del file JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-900">
          Impostazioni & Backup
        </h1>
        <p className="text-sm text-stone-500">
          Gestisci l'archiviazione locale, scarica i backup in formato JSON o ripristina i dati.
        </p>
      </div>

      {/* Storage Information Card */}
      <section className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <h2 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-amber-600" /> Stato Archiviazione Locale
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
            <span className="text-xs text-amber-800 font-semibold block uppercase">
              Ricette in Memoria
            </span>
            <span className="text-2xl font-serif font-bold text-amber-900">
              {recipes.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
            <span className="text-xs text-emerald-800 font-semibold block uppercase">
              Voci Spesa
            </span>
            <span className="text-2xl font-serif font-bold text-emerald-900">
              {shoppingList.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200">
            <span className="text-xs text-stone-600 font-semibold block uppercase">
              Modalità PWA
            </span>
            <span className="text-sm font-bold text-stone-800 flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Offline Pronto
            </span>
          </div>
        </div>
      </section>

      {/* Backup Export / Import Section */}
      <section className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <h2 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
          <Download className="w-5 h-5 text-amber-600" /> Esporta e Importa Backup JSON
        </h2>

        <p className="text-sm text-stone-600 leading-relaxed">
          Tutte le tue ricette sono salvate in locale sul tuo dispositivo. Puoi scaricare una copia di sicurezza in formato <code>.json</code> e ricaricarla su qualsiasi altro dispositivo o browser.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          {/* Export Button */}
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleExport}
            icon={Download}
          >
            Esporta Backup (.json)
          </Button>

          {/* Import Button */}
          <label className="w-full">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              size="md"
              fullWidth
              as="span"
              icon={Upload}
            >
              Importa Backup JSON
            </Button>
          </label>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Deduplicazione intelligente:</strong> durante l'importazione, le ricette con lo stesso titolo esatto verranno automaticamente aggiornate con le ultime modifiche, evitando duplicati.
          </span>
        </div>
      </section>

      {/* Reset to Sample Data Section */}
      <section className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <h2 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-red-600" /> Ripristina Ricette di Esempio
        </h2>

        <p className="text-sm text-stone-600">
          Reimposta il database con le 3 ricette di esempio iniziali (Pasta Fresca, Tagliatelle al Ragù, Tiramisù).
        </p>

        <Button
          variant="danger"
          size="md"
          onClick={() => setIsResetModalOpen(true)}
          icon={RotateCcw}
        >
          Ripristina Ricette Iniziali
        </Button>
      </section>

      {/* Import Summary Result Modal */}
      <Modal
        isOpen={!!importSummary}
        onClose={() => setImportSummary(null)}
        title="Esito Importazione Backup"
      >
        {importSummary && (
          <div className="space-y-4">
            <p className="text-sm text-stone-700">
              L'operazione di merge è stata completata con successo:
            </p>
            <ul className="space-y-2 text-sm bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <li>• Ricette contenute nel file: <strong>{importSummary.totalImported}</strong></li>
              <li>• Nuove ricette aggiunte: <strong className="text-emerald-700">{importSummary.addedCount}</strong></li>
              <li>• Ricette esistenti aggiornate: <strong className="text-amber-700">{importSummary.updatedCount}</strong></li>
            </ul>
            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={() => setImportSummary(null)}>
                Perfetto
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Confirm Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Conferma Ripristino"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-700">
            Sei sicuro di voler ripristinare il ricettario con i dati di esempio iniziali? Le ricette attuali verranno sostituite.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Button variant="secondary" onClick={() => setIsResetModalOpen(false)}>
              Annulla
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onResetSampleData();
                setIsResetModalOpen(false);
              }}
            >
              Ripristina Ora
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
