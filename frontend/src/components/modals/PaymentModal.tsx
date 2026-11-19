import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Order } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface PaymentModalProps {
  order: Order | null;
  onClose: () => void;
  onApplyPayment: (orderId: string, mode: 'paid' | 'unpaid' | 'partial', dpAmount?: number, method?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  onClose,
  onApplyPayment
}) => {
  if (!order) return null;

  const [dpMethod, setDpMethod] = useState(order.payment_method || 'GCash');
  const [dpAmount, setDpAmount] = useState(
    order.amount_paid > 0
      ? String(order.amount_paid)
      : String(Math.round(order.total_amount / 2))
  );

  const parsedDp = parseFloat(dpAmount) || 0;
  const remainingBalance = Math.max(0, order.total_amount - parsedDp);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl border-t border-stone-200 p-4 space-y-4 animate-slide-up">
        <div className="w-10 h-1.5 rounded-full bg-stone-300 mx-auto" />
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-stone-900">
              Update Payment &bull; {order.order_code}
            </h3>
            <p className="text-xs text-stone-500">
              {order.customer_name} &bull; Order Total:{' '}
              <strong className="text-stone-900">
                {formatCurrency(order.total_amount)}
              </strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 active:scale-95 transition"
            aria-label="Close payment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector */}
        <div className="grid grid-cols-4 gap-1.5">
          {['GCash', 'Maya', 'COD', 'Cash'].map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => setDpMethod(ch)}
              className={`min-h-[44px] rounded-xl text-xs font-extrabold border transition ${
                dpMethod === ch
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* Partial DP Input + Quick Split Buttons */}
        <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-700">Record Partial DP (₱):</span>
            <span className="font-extrabold text-rose-700">
              Bal: {formatCurrency(remainingBalance)}
            </span>
          </div>

          <input
            type="number"
            min="0"
            max={order.total_amount}
            value={dpAmount}
            onChange={(e) => setDpAmount(e.target.value)}
            className="w-full min-h-[46px] rounded-xl border border-amber-400 bg-white px-3 text-sm font-black text-stone-900 outline-none"
          />

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setDpAmount(String(Math.round(order.total_amount / 2)))}
              className="min-h-[40px] rounded-xl bg-white text-stone-800 font-extrabold text-xs border border-stone-200 active:scale-95"
            >
              50% DP
            </button>
            <button
              type="button"
              onClick={() => setDpAmount(String(Math.min(order.total_amount, 200)))}
              className="min-h-[40px] rounded-xl bg-white text-stone-800 font-extrabold text-xs border border-stone-200 active:scale-95"
            >
              ₱200
            </button>
            <button
              type="button"
              onClick={() => setDpAmount(String(Math.min(order.total_amount, 500)))}
              className="min-h-[40px] rounded-xl bg-white text-stone-800 font-extrabold text-xs border border-stone-200 active:scale-95"
            >
              ₱500
            </button>
          </div>

          <button
            type="button"
            onClick={() => onApplyPayment(order.id, 'partial', parsedDp, dpMethod)}
            className="w-full min-h-[48px] rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs active:scale-95 transition"
          >
            Save Partial DP ({formatCurrency(parsedDp)})
          </button>
        </div>

        {/* One-Tap Full Paid vs Unpaid Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pb-2">
          <button
            type="button"
            onClick={() => onApplyPayment(order.id, 'unpaid', 0, dpMethod)}
            className="min-h-[50px] rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-extrabold text-xs active:scale-95 transition"
          >
            Mark Unpaid (₱0)
          </button>
          <button
            type="button"
            onClick={() => onApplyPayment(order.id, 'paid', order.total_amount, dpMethod)}
            className="min-h-[50px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm active:scale-95 transition"
          >
            Mark Full Paid ({formatCurrency(order.total_amount)})
          </button>
        </div>
      </div>
    </div>
  );
};
