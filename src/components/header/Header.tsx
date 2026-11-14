import React from 'react';
import {
  ChefHat,
  RotateCcw,
  Wallet,
  AlertCircle,
  ArrowRight,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import type { DateFilterType, CashSummary, AuthState, SyncStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface HeaderProps {
  dateFilter: DateFilterType;
  setDateFilter: (filter: DateFilterType) => void;
  todayOrderCount: number;
  tomorrowOrderCount: number;
  cashSummary: CashSummary;
  authState: AuthState;
  syncStatus: SyncStatus;
  pendingCount: number;
  onOpenAuth: () => void;
  onResetDemo: () => void;
  onOpenTally: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dateFilter,
  setDateFilter,
  todayOrderCount,
  tomorrowOrderCount,
  cashSummary,
  authState,
  syncStatus,
  pendingCount,
  onOpenAuth,
  onResetDemo,
  onOpenTally
}) => {
  const shopTitle = authState.seller?.shop_name || 'BakeFlow';

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 pt-3 pb-3 space-y-2.5">
      {/* App Brand + Cloud Sync Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <ChefHat className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold tracking-tight text-stone-900 leading-none truncate">
              {shopTitle}
            </h1>
            <p className="text-[11px] text-stone-500 mt-0.5 truncate">
              One-Thumb Kitchen &amp; DM Ledger
            </p>
          </div>
        </div>

        {/* Sync & Auth Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAuth}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition active:scale-95 ${
              syncStatus === 'syncing'
                ? 'bg-sky-50 text-sky-700 border-sky-300'
                : syncStatus === 'synced'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : syncStatus === 'offline'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : syncStatus === 'error'
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-stone-100 text-stone-700 border-stone-200'
            }`}
            title="Cloud sync & shop account"
          >
            {syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-sky-600" />
                <span>Syncing</span>
              </>
            ) : syncStatus === 'synced' ? (
              <>
                <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cloud ✓</span>
              </>
            ) : syncStatus === 'offline' ? (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline{pendingCount > 0 ? ` (${pendingCount})` : ''}</span>
              </>
            ) : syncStatus === 'error' ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Sync Retry</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-stone-500" />
                <span>Guest / Connect</span>
              </>
            )}
          </button>

          <button
            onClick={onResetDemo}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 active:scale-95 transition"
            title="Reset sample orders"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Full-Width Thumb-Sized Date Segmented Control (Today vs Tomorrow) */}
      <div className="grid grid-cols-2 gap-1.5 bg-stone-100 p-1 rounded-2xl border border-stone-200/80">
        <button
          type="button"
          onClick={() => setDateFilter('today')}
          className={`min-h-[44px] rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
            dateFilter === 'today'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Today</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              dateFilter === 'today'
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            {todayOrderCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setDateFilter('tomorrow')}
          className={`min-h-[44px] rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
            dateFilter === 'tomorrow'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Tomorrow</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              dateFilter === 'tomorrow'
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            {tomorrowOrderCount}
          </span>
        </button>
      </div>

      {/* Tappable Cash Flow Bar -> Opens End-of-Day Cash & Sales Tally Drawer */}
      <button
        type="button"
        onClick={onOpenTally}
        className="w-full text-left rounded-2xl border border-stone-200 bg-stone-50/90 hover:bg-amber-50/50 p-2 transition active:scale-[0.99] space-y-1.5"
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-[11px] font-bold text-emerald-800">Collected</span>
            </div>
            <span className="text-xs font-extrabold text-emerald-700">
              {formatCurrency(cashSummary.totalCollected)}
            </span>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200/80">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
              <span className="text-[11px] font-bold text-rose-800">Receivable</span>
            </div>
            <span className="text-xs font-extrabold text-rose-700">
              {formatCurrency(cashSummary.uncollected)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] font-bold text-stone-500">
          <span>
            Gross Booked: <strong className="text-stone-800">{formatCurrency(cashSummary.grossBooked)}</strong>
          </span>
          <span className="text-amber-700 flex items-center gap-0.5">
            Tap for {dateFilter === 'today' ? "Today's" : "Tomorrow's"} Tally
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </button>
    </header>
  );
};
