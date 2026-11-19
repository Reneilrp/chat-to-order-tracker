import React, { useState } from 'react';
import { Sparkles, Trash2, Download, Upload } from 'lucide-react';
import type { MenuItem, DateFilterType } from '../../types';
import { formatCurrency, generateId } from '../../utils/formatters';

interface MenuManagerProps {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  bookedQtySelectedDate: Record<string, number>;
  dateFilter: DateFilterType;
  todayStr: string;
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  onShowToast: (msg: string) => void;
}

export const MenuManager: React.FC<MenuManagerProps> = ({
  menuItems,
  setMenuItems,
  bookedQtySelectedDate,
  dateFilter,
  todayStr,
  orders,
  setOrders,
  onShowToast
}) => {
  const [newMenuForm, setNewMenuForm] = useState({
    name: '',
    variant: 'Box of 6',
    unit_price: '',
    dailyCap: '15',
    keywords: ''
  });

  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuForm.name.trim() || !newMenuForm.unit_price) return;

    const parsedKeywords = newMenuForm.keywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    if (parsedKeywords.length === 0) {
      parsedKeywords.push(newMenuForm.name.trim().toLowerCase());
    }

    const created: MenuItem = {
      id: `menu-${generateId()}`,
      name: newMenuForm.name.trim(),
      variant: newMenuForm.variant.trim() || 'Regular',
      unit_price: parseFloat(newMenuForm.unit_price) || 0,
      dailyCap: Math.max(1, parseInt(newMenuForm.dailyCap, 10) || 15),
      keywords: parsedKeywords
    };

    setMenuItems((prev) => [...prev, created]);
    setNewMenuForm({ name: '', variant: 'Box of 6', unit_price: '', dailyCap: '15', keywords: '' });
    onShowToast(`Added "${created.name}" (Cap: ${created.dailyCap}/day)!`);
  };

  const updateMenuDailyCap = (menuId: string, delta: number) => {
    setMenuItems((prev) =>
      prev.map((m) =>
        m.id === menuId ? { ...m, dailyCap: Math.max(1, (m.dailyCap || 15) + delta) } : m
      )
    );
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
    onShowToast('Menu item removed.');
  };

  const handleExportJsonBackup = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      app: 'BakeFlow PWA',
      orders,
      menuItems
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bakeflow-backup-${todayStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Downloaded BakeFlow JSON backup!');
  };

  const handleImportJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse((event.target?.result as string) || '{}');
        if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
        if (Array.isArray(parsed.menuItems)) setMenuItems(parsed.menuItems);
        onShowToast('Restored orders & menu from backup!');
      } catch {
        onShowToast('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Add Product Form Card */}
      <form
        onSubmit={handleAddMenuItem}
        className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-xs"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-extrabold text-stone-900">
            Add Product &amp; Daily Batch Cap
          </h2>
        </div>

        <div className="space-y-2.5">
          <input
            type="text"
            required
            value={newMenuForm.name}
            onChange={(e) => setNewMenuForm({ ...newMenuForm, name: e.target.value })}
            placeholder="Product Name (e.g. Sans Rival)"
            className="w-full min-h-[44px] rounded-xl border border-stone-300 bg-stone-50 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-amber-500"
          />

          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={newMenuForm.variant}
              onChange={(e) => setNewMenuForm({ ...newMenuForm, variant: e.target.value })}
              placeholder="Variant"
              className="min-h-[44px] rounded-xl border border-stone-300 bg-stone-50 px-3 text-xs font-medium outline-none focus:bg-white focus:border-amber-500"
            />
            <input
              type="number"
              required
              min="1"
              value={newMenuForm.unit_price}
              onChange={(e) =>
                setNewMenuForm({ ...newMenuForm, unit_price: e.target.value })
              }
              placeholder="Price (₱)"
              className="min-h-[44px] rounded-xl border border-stone-300 bg-stone-50 px-3 text-xs font-bold outline-none focus:bg-white focus:border-amber-500"
            />
            <input
              type="number"
              required
              min="1"
              value={newMenuForm.dailyCap}
              onChange={(e) =>
                setNewMenuForm({ ...newMenuForm, dailyCap: e.target.value })
              }
              placeholder="Cap/day"
              className="min-h-[44px] rounded-xl border border-stone-300 bg-stone-50 px-3 text-xs font-bold outline-none focus:bg-white focus:border-amber-500"
            />
          </div>

          <input
            type="text"
            value={newMenuForm.keywords}
            onChange={(e) => setNewMenuForm({ ...newMenuForm, keywords: e.target.value })}
            placeholder="Chat slang keywords: sans rival, sansrival"
            className="w-full min-h-[44px] rounded-xl border border-stone-300 bg-stone-50 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-amber-500"
          />
        </div>

        <button
          type="submit"
          className="w-full min-h-[48px] rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-extrabold active:scale-95 transition"
        >
          + Save to Menu &amp; Auto-Parser
        </button>
      </form>

      {/* Existing Menu Items List with Live Capacity Progress Bars & Cap Adjusters */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
            Daily Batch Caps ({dateFilter === 'today' ? 'Today' : 'Tomorrow'})
          </h3>
          <span className="text-[11px] font-bold text-stone-400">
            {menuItems.length} items
          </span>
        </div>

        {menuItems.map((item) => {
          const booked = bookedQtySelectedDate[item.id] || 0;
          const cap = item.dailyCap || 15;
          const pct = Math.min(100, Math.round((booked / cap) * 100));
          const isOver = booked > cap;
          const isHigh = booked >= cap * 0.8;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 p-3.5 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-extrabold text-stone-900">{item.name}</p>
                    <span className="text-[11px] text-stone-500">({item.variant})</span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    Keywords: <span className="font-medium text-stone-700">{item.keywords.join(', ')}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-black text-amber-700">
                    {formatCurrency(item.unit_price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteMenuItem(item.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition"
                    aria-label="Remove menu item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Capacity Bar & One-Thumb Daily Cap Adjuster */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className={isOver ? 'text-rose-700' : isHigh ? 'text-amber-700' : 'text-stone-600'}>
                      Booked: {booked} / {cap}
                    </span>
                    <span className="text-stone-400">
                      {Math.max(0, cap - booked)} left
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isOver
                          ? 'bg-rose-500'
                          : isHigh
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* 44px Cap Steppers */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateMenuDailyCap(item.id, -1)}
                    className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-black text-sm flex items-center justify-center border border-stone-200 active:scale-95"
                    aria-label="Decrease daily cap"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMenuDailyCap(item.id, 1)}
                    className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-black text-sm flex items-center justify-center border border-stone-200 active:scale-95"
                    aria-label="Increase daily cap"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Offline Data Safety: Export / Import JSON Backup */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2.5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
          Local Data Backup &amp; Restore
        </h3>
        <p className="text-[11px] text-stone-500">
          Your orders stay offline on this phone. Save a quick JSON snapshot before clearing browser data.
        </p>
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleExportJsonBackup}
            className="min-h-[48px] px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export Backup</span>
          </button>

          <label className="min-h-[48px] px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition">
            <Upload className="w-4 h-4 text-stone-600" />
            <span>Restore JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportJsonBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
