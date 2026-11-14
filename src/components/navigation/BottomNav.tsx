import React from 'react';
import { ShoppingBag, ChefHat, UtensilsCrossed } from 'lucide-react';
import type { ActiveTabType } from '../../types';

interface BottomNavProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  orderCount: number;
  prepCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  orderCount,
  prepCount
}) => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30 w-full max-w-md h-16 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 flex items-center justify-around">
      <button
        type="button"
        onClick={() => setActiveTab('orders')}
        className={`min-h-[48px] flex-1 mx-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition ${
          activeTab === 'orders'
            ? 'bg-amber-50 text-amber-900 font-extrabold'
            : 'text-stone-500 hover:text-stone-800 font-semibold'
        }`}
      >
        <ShoppingBag className={`w-5 h-5 ${activeTab === 'orders' ? 'text-amber-600' : ''}`} />
        <span className="text-[11px]">Orders ({orderCount})</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('prep')}
        className={`min-h-[48px] flex-1 mx-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition relative ${
          activeTab === 'prep'
            ? 'bg-amber-50 text-amber-900 font-extrabold'
            : 'text-stone-500 hover:text-stone-800 font-semibold'
        }`}
      >
        <div className="relative">
          <ChefHat className={`w-5 h-5 ${activeTab === 'prep' ? 'text-amber-600' : ''}`} />
          {prepCount > 0 && (
            <span className="absolute -top-1 -right-2.5 px-1.5 py-0.2 rounded-full bg-stone-900 text-amber-300 text-[9px] font-black">
              {prepCount}
            </span>
          )}
        </div>
        <span className="text-[11px]">Kitchen Prep</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('menu')}
        className={`min-h-[48px] flex-1 mx-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition ${
          activeTab === 'menu'
            ? 'bg-amber-50 text-amber-900 font-extrabold'
            : 'text-stone-500 hover:text-stone-800 font-semibold'
        }`}
      >
        <UtensilsCrossed
          className={`w-5 h-5 ${activeTab === 'menu' ? 'text-amber-600' : ''}`}
        />
        <span className="text-[11px]">Menu &amp; Caps</span>
      </button>
    </nav>
  );
};
