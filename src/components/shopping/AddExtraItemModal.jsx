import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

export const AddExtraItemModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd(name.trim(), amount ? parseFloat(amount) : null, unit.trim());
    setName('');
    setAmount('');
    setUnit('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aggiungi Elemento alla Spesa">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome Prodotto / Ingrediente *"
          placeholder="Es. Carta forno, Latte intero, Pane..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quantità (opzionale)"
            type="number"
            step="any"
            placeholder="Es. 2, 500..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Unità di Misura
            </label>
            <input
              type="text"
              placeholder="Es. g, kg, pz, l, bottiglia..."
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl text-stone-800 px-4 py-2.5 text-sm min-h-[44px] focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button variant="primary" type="submit" icon={Plus}>
            Aggiungi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
