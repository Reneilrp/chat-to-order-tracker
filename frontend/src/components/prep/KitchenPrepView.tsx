import React from 'react';
import { ChefHat, CheckCheck, CheckCircle2, Circle } from 'lucide-react';
import type { KitchenPrepBatch, DateFilterType } from '../../types';

interface KitchenPrepViewProps {
  dateFilter: DateFilterType;
  kitchenPrepList: KitchenPrepBatch[];
  prepProgress: { total: number; completed: number; percent: number };
  checkedPrepKeys: Record<string, boolean>;
  targetDateStr: string;
  onTogglePrepCheck: (key: string) => void;
}

export const KitchenPrepView: React.FC<KitchenPrepViewProps> = ({
  dateFilter,
  kitchenPrepList,
  prepProgress,
  checkedPrepKeys,
  targetDateStr,
  onTogglePrepCheck
}) => {
  return (
    <div className="space-y-4">
      {/* Visual Production Progress Header Card */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-extrabold">
                Kitchen Prep ({dateFilter === 'today' ? 'Today' : 'Tomorrow'})
              </h2>
              <p className="text-[11px] text-stone-400">
                Tap a batch card as it finishes baking/packing
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-stone-800 text-amber-300 border border-stone-700">
            {prepProgress.completed} / {prepProgress.total} prepped
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${prepProgress.percent}%` }}
          />
        </div>
      </div>

      {/* Checkable Prep Batch Rows */}
      {kitchenPrepList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2">
          <CheckCheck className="w-9 h-9 text-emerald-500 mx-auto" />
          <p className="text-sm font-bold text-stone-800">All caught up!</p>
          <p className="text-xs text-stone-500">
            No active items left to prep for {dateFilter === 'today' ? 'Today' : 'Tomorrow'}.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {kitchenPrepList.map((batch) => {
            const isChecked = !!checkedPrepKeys[`${targetDateStr}_${batch.key}`];
            const capRatio = batch.dailyCap
              ? Math.round((batch.totalBookedDay / batch.dailyCap) * 100)
              : 0;
            const isNearOrOverCap = batch.dailyCap && batch.totalBookedDay >= batch.dailyCap * 0.8;

            return (
              <button
                key={batch.key}
                type="button"
                onClick={() => onTogglePrepCheck(batch.key)}
                className={`w-full text-left min-h-[72px] rounded-2xl border p-4 transition active:scale-[0.99] flex items-start gap-3.5 shadow-2xs ${
                  isChecked
                    ? 'bg-stone-100/90 border-stone-200 opacity-65'
                    : 'bg-white border-stone-200 hover:border-amber-400'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-amber-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-extrabold truncate ${
                        isChecked ? 'line-through text-stone-500' : 'text-stone-900'
                      }`}
                    >
                      {batch.item_name}
                    </p>
                    <span
                      className={`px-3 py-1 rounded-xl text-sm font-black shrink-0 ${
                        isChecked
                          ? 'bg-stone-300 text-stone-700'
                          : 'bg-stone-900 text-amber-300'
                      }`}
                    >
                      {batch.total_qty}x
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-xs font-medium text-stone-500">
                      {batch.variant}
                    </span>

                    {batch.dailyCap && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          batch.totalBookedDay > batch.dailyCap
                            ? 'bg-rose-100 text-rose-800'
                            : isNearOrOverCap
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        Day Cap: {batch.totalBookedDay}/{batch.dailyCap} ({capRatio}%)
                      </span>
                    )}
                  </div>

                  {batch.notes.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {batch.notes.map((noteStr, idx) => (
                        <p
                          key={idx}
                          className="text-xs font-semibold text-orange-800 bg-amber-100/80 border border-amber-200/80 px-2.5 py-1 rounded-lg"
                        >
                          Note: {noteStr}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
