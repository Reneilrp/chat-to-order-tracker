import React from 'react';
import { TrendingUp, X, Download } from 'lucide-react';
import type { CashSummary, DateFilterType } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface DailyTallySheetProps {
  isOpen: boolean;
  onClose: () => void;
  dateFilter: DateFilterType;
  cashSummary: CashSummary;
  onExportBackup: () => void;
}

export const DailyTallySheet: React.FC<DailyTallySheetProps> = ({
  isOpen,
  onClose,
  dateFilter,
  cashSummary,
  onExportBackup
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl border-t border-stone-200 p-4 space-y-4 animate-slide-up">
        <div className="w-10 h-1.5 rounded-full bg-stone-300 mx-auto" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">
                {dateFilter === 'today' ? "Today's" : "Tomorrow's"} Cash &amp; Sales Tally
              </h3>
              <p className="text-[11px] text-stone-500">
                {cashSummary.completedOrdersCount} Completed &bull; {cashSummary.activeOrdersCount}{' '}
                Active Orders
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 active:scale-95 transition"
            aria-label="Close tally sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Financial Breakdown Cards */}
        <div className="space-y-2.5">
          <div className="bg-stone-900 text-white rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Gross Booked Sales
              </p>
              <p className="text-xl font-black text-amber-300 mt-0.5">
                {formatCurrency(cashSummary.grossBooked)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-stone-400">Collection Rate</p>
              <p className="text-sm font-extrabold text-emerald-400">
                {cashSummary.grossBooked > 0
                  ? Math.round((cashSummary.totalCollected / cashSummary.grossBooked) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5">
              <p className="text-[11px] font-bold text-emerald-800">GCash / Maya / Bank</p>
              <p className="text-base font-black text-emerald-700 mt-1">
                {formatCurrency(cashSummary.ewalletCollected)}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5">
              <p className="text-[11px] font-bold text-emerald-800">Cash / COD on Hand</p>
              <p className="text-base font-black text-emerald-700 mt-1">
                {formatCurrency(cashSummary.cashCodCollected)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-rose-900">
                Uncollected Receivables (Pending Balances)
              </p>
              <p className="text-[11px] text-rose-700">
                Remaining DP balances &amp; unpaid COD orders
              </p>
            </div>
            <span className="text-base font-black text-rose-700">
              {formatCurrency(cashSummary.uncollected)}
            </span>
          </div>
        </div>

        {/* Export JSON Backup & Close */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 pb-2">
          <button
            type="button"
            onClick={onExportBackup}
            className="min-h-[48px] px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 text-xs font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>Export Backup</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-3 rounded-xl bg-stone-900 text-white text-xs font-extrabold active:scale-95 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
