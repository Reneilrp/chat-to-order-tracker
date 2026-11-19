import React from 'react';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Bell,
  Bike,
  ArrowRight,
  Trash2
} from 'lucide-react';
import type { Order } from '../../types';
import { formatCurrency, formatDisplayTime } from '../../utils/formatters';

interface OrderCardProps {
  order: Order;
  copiedFeedback: string | null;
  onAdvanceStatus: (id: string) => void;
  onDeleteOrder: (id: string) => void;
  onOpenPaymentModal: (order: Order) => void;
  onCopyReceipt: (order: Order) => void;
  onCopyReminder: (order: Order) => void;
  onCopyRider: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  copiedFeedback,
  onAdvanceStatus,
  onDeleteOrder,
  onOpenPaymentModal,
  onCopyReceipt,
  onCopyReminder,
  onCopyRider
}) => {
  const isPaid = order.payment_status === 'paid';
  const isPartial = order.payment_status === 'partial';
  const balanceDue = Math.max(0, order.total_amount - order.amount_paid);

  const nextStepLabel: Record<string, string> = {
    pending: 'Start Prep',
    prepping: 'Mark Ready',
    ready: 'Complete',
    completed: 'Done ✓',
    cancelled: 'Reopen'
  };

  const statusBadgeColor = {
    pending: 'bg-stone-100 text-stone-700 border-stone-200',
    prepping: 'bg-amber-100 text-amber-900 border-amber-300',
    ready: 'bg-sky-100 text-sky-900 border-sky-300',
    completed: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    cancelled: 'bg-rose-100 text-rose-900 border-rose-300'
  }[order.order_status];

  return (
    <article
      className={`bg-white rounded-2xl border shadow-xs overflow-hidden transition ${
        order.order_status === 'completed'
          ? 'border-stone-200/80 opacity-85'
          : 'border-stone-200'
      }`}
    >
      {/* Card Header: Customer Name, Order Code, Progress Pill & Delete */}
      <div className="px-3.5 py-3 border-b border-stone-100 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
              {order.order_code}
            </span>
            <h3 className="text-sm font-extrabold text-stone-900 truncate">
              {order.customer_name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onAdvanceStatus(order.id)}
            className={`min-h-[34px] px-2.5 rounded-xl text-[11px] font-extrabold border capitalize flex items-center gap-1 active:scale-95 transition ${statusBadgeColor}`}
            title="Tap to advance kitchen status"
          >
            <span>{order.order_status}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteOrder(order.id)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition"
            aria-label="Delete order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Body: Line Items & Fulfillment Time/Place */}
      <div className="px-3.5 py-3 space-y-2.5">
        <div className="space-y-1.5">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 font-extrabold text-[11px]">
                    {item.quantity}x
                  </span>
                  <span className="font-bold text-stone-900">
                    {item.item_name}
                  </span>
                  {item.variant && (
                    <span className="text-stone-400 text-[11px]">
                      ({item.variant})
                    </span>
                  )}
                </div>
                {item.notes && (
                  <p className="text-[11px] font-semibold text-orange-700 pl-1">
                    ↳ Note: {item.notes}
                  </p>
                )}
              </div>

              <span className="font-bold text-stone-700 shrink-0">
                {formatCurrency(item.quantity * item.unit_price)}
              </span>
            </div>
          ))}
        </div>

        {/* Fulfillment & Total Row */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5 text-stone-600 min-w-0">
            <span className="inline-flex items-center gap-1 font-semibold capitalize truncate">
              {order.fulfillment_type === 'delivery' ? (
                <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span className="truncate">
                {order.fulfillment_type}
                {order.delivery_address ? ` • ${order.delivery_address}` : ''}
              </span>
            </span>

            <span className="inline-flex items-center gap-1 font-semibold text-stone-700 shrink-0">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {formatDisplayTime(order.due_time)}
            </span>
          </div>

          <span className="text-sm font-black text-stone-900 shrink-0">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      </div>

      {/* Separated Bottom Thumb-Friendly Action Zone (>= 48px targets) */}
      <div className="px-3.5 py-2.5 bg-stone-50 border-t border-stone-100 space-y-2">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Payment Badge Button -> Opens DP / Paid Quick Popover */}
          <button
            type="button"
            onClick={() => onOpenPaymentModal(order)}
            className={`min-h-[48px] px-2.5 rounded-xl text-[11px] font-extrabold border flex flex-col items-center justify-center leading-tight active:scale-95 transition ${
              isPaid
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : isPartial
                ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-2xs'
                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
            }`}
          >
            {isPaid ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Paid: {formatCurrency(order.total_amount)}</span>
              </span>
            ) : isPartial ? (
              <>
                <span>DP: {formatCurrency(order.amount_paid)} ({order.payment_method})</span>
                <span className="text-[10px] font-black underline">
                  Bal: {formatCurrency(balanceDue)}
                </span>
              </>
            ) : (
              <>
                <span>Unpaid: {formatCurrency(order.total_amount)}</span>
                <span className="text-[10px] opacity-80">Tap to log DP/Paid</span>
              </>
            )}
          </button>

          {/* Copy Confirmation Receipt */}
          <button
            type="button"
            onClick={() => onCopyReceipt(order)}
            className="min-h-[48px] px-2.5 rounded-xl text-xs font-extrabold bg-white hover:bg-amber-50 text-stone-900 border border-stone-300 flex items-center justify-center gap-1.5 active:scale-95 transition shadow-2xs"
          >
            {copiedFeedback === `${order.id}_receipt` ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Copy Receipt</span>
              </>
            )}
          </button>
        </div>

        {/* Contextual Secondary Copy Pills: Payment Reminder & Rider Handoff */}
        {(!isPaid || order.fulfillment_type === 'delivery') && (
          <div className="flex gap-2">
            {!isPaid && (
              <button
                type="button"
                onClick={() => onCopyReminder(order)}
                className="flex-1 min-h-[44px] px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                {copiedFeedback === `${order.id}_reminder` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Reminder Copied!</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 text-amber-700" />
                    <span>Copy Reminder</span>
                  </>
                )}
              </button>
            )}

            {order.fulfillment_type === 'delivery' && (
              <button
                type="button"
                onClick={() => onCopyRider(order)}
                className="flex-1 min-h-[44px] px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-950 border border-sky-300 text-[11px] font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                {copiedFeedback === `${order.id}_rider` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Rider Info Copied!</span>
                  </>
                ) : (
                  <>
                    <Bike className="w-3.5 h-3.5 text-sky-700" />
                    <span>Copy Rider Info</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* One-Tap Status Progression Strip if not yet completed */}
      {order.order_status !== 'completed' && (
        <button
          type="button"
          onClick={() => onAdvanceStatus(order.id)}
          className="w-full min-h-[40px] bg-stone-100/80 hover:bg-amber-100/60 border-t border-stone-200/70 text-[11px] font-bold text-stone-700 flex items-center justify-center gap-1.5 transition"
        >
          <span>Kitchen Step: {nextStepLabel[order.order_status] || 'Advance'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
        </button>
      )}
    </article>
  );
};
