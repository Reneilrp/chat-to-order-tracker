import React, { useMemo } from 'react';
import {
  ClipboardPaste,
  X,
  Plus,
  Edit3,
  Layers,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import type { DraftOrder, MenuItem, Order, SampleChat } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface IntakeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chatInput: string;
  setChatInput: (text: string) => void;
  parseLatencyMs: number | null;
  clipboardNotice: string | null;
  onPasteClipboard: () => void;
  sampleChats: SampleChat[];
  onSelectSampleChat: (text: string) => void;
  matchingExistingOrder: Order | null;
  onAppendToExistingOrder: () => void;
  onDismissAppend: () => void;
  menuItems: MenuItem[];
  bookedQtyDraftDate: Record<string, number>;
  onQuickAddMenuItem: (item: MenuItem) => void;
  draftOrder: DraftOrder;
  setDraftOrder: React.Dispatch<React.SetStateAction<DraftOrder>>;
  onUpdateDraftItemQty: (itemId: string, delta: number) => void;
  onUpdateDraftItemNote: (itemId: string, note: string) => void;
  draftTotalAmount: number;
  draftRemainingBalance: number;
  draftCapWarnings: string[];
  todayStr: string;
  tomorrowStr: string;
  onSaveOrder: (e: React.FormEvent) => void;
}

export const IntakeDrawer: React.FC<IntakeDrawerProps> = ({
  isOpen,
  onClose,
  chatInput,
  setChatInput,
  parseLatencyMs,
  clipboardNotice,
  onPasteClipboard,
  sampleChats,
  onSelectSampleChat,
  matchingExistingOrder,
  onAppendToExistingOrder,
  onDismissAppend,
  menuItems,
  bookedQtyDraftDate,
  onQuickAddMenuItem,
  draftOrder,
  setDraftOrder,
  onUpdateDraftItemQty,
  onUpdateDraftItemNote,
  draftTotalAmount,
  draftRemainingBalance,
  draftCapWarnings,
  todayStr,
  tomorrowStr,
  onSaveOrder
}) => {
  if (!isOpen) return null;

  const handlePaymentStatusChange = (newStatus: 'unpaid' | 'partial' | 'paid') => {
    setDraftOrder((prev) => ({
      ...prev,
      payment_status: newStatus,
      amount_paid:
        newStatus === 'paid'
          ? draftTotalAmount
          : newStatus === 'partial'
          ? prev.amount_paid > 0 && prev.amount_paid < draftTotalAmount
            ? prev.amount_paid
            : Math.round(draftTotalAmount / 2)
          : 0
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl border-t border-stone-200 max-h-[92vh] flex flex-col overflow-hidden animate-slide-up">
        {/* Drag Handle & Sheet Header */}
        <div className="px-4 pt-3 pb-2.5 border-b border-stone-100 shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-stone-300 mx-auto mb-2.5" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-extrabold text-stone-900">
                New Order from Chat / Quick-Tap
              </h2>
              {parseLatencyMs !== null && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {parseLatencyMs}ms
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 active:scale-95 transition"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4">
          {/* ONE-TAP PASTE FROM CLIPBOARD BUTTON */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={onPasteClipboard}
              className="w-full min-h-[52px] rounded-2xl bg-amber-100 hover:bg-amber-200/80 border-2 border-amber-400 text-amber-950 font-extrabold text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition shadow-2xs"
            >
              <ClipboardPaste className="w-4 h-4 text-amber-700" />
              <span>One-Tap Paste from Clipboard</span>
            </button>

            {clipboardNotice && (
              <p className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                {clipboardNotice}
              </p>
            )}

            {/* Quick-Test Sample Messenger/IG Taglish Pills */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Or tap a sample Taglish DM to test:
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {sampleChats.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSampleChat(sample.text)}
                    className="min-h-[38px] px-3 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-950 border border-stone-200 text-[11px] font-bold whitespace-nowrap shrink-0 active:scale-95 transition"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Paste / Edit Chat Snippet Textarea */}
            <div className="relative">
              <textarea
                rows={2}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder='Paste Messenger/IG DM thread here... e.g. "Carlo: 2 boxes classic brownies 500 dp gcash"'
                className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:border-amber-500 outline-none"
              />
              {chatInput && (
                <button
                  type="button"
                  onClick={() => setChatInput('')}
                  className="absolute right-2 bottom-2 text-[10px] font-bold px-2 py-1 rounded-md bg-stone-200 text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* APPEND-TO-EXISTING-ORDER DETECTION BANNER */}
          {matchingExistingOrder && (
            <div className="rounded-2xl bg-sky-50 border-2 border-sky-400 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-start gap-2">
                <Layers className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                <div className="text-xs text-sky-950">
                  <p className="font-extrabold">
                    {matchingExistingOrder.customer_name} already has{' '}
                    <span className="underline">{matchingExistingOrder.order_code}</span>{' '}
                    {matchingExistingOrder.due_date === todayStr ? 'today' : 'tomorrow'}!
                  </p>
                  <p className="text-[11px] text-sky-800 mt-0.5">
                    Current total: {formatCurrency(matchingExistingOrder.total_amount)} &bull;{' '}
                    {matchingExistingOrder.items.length} item(s)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onAppendToExistingOrder}
                  className="min-h-[44px] px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold active:scale-95 transition"
                >
                  Add to {matchingExistingOrder.order_code}
                </button>
                <button
                  type="button"
                  onClick={onDismissAppend}
                  className="min-h-[44px] px-3 rounded-xl bg-white hover:bg-sky-100 text-sky-900 border border-sky-300 text-xs font-bold active:scale-95 transition"
                >
                  Keep Separate
                </button>
              </div>
            </div>
          )}

          {/* Quick-Tap Menu Chips with Live Daily Stock Cap Status */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
              Quick-Tap Add Item (Live Stock Cap):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {menuItems.map((item) => {
                const alreadyBooked = bookedQtyDraftDate[item.id] || 0;
                const inDraft =
                  draftOrder.items.find((d) => d.menu_item_id === item.id)?.quantity || 0;
                const cap = item.dailyCap || 15;
                const remaining = cap - (alreadyBooked + inDraft);
                const isSoldOut = remaining <= 0;
                const isLow = remaining > 0 && remaining <= Math.ceil(cap * 0.2);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onQuickAddMenuItem(item)}
                    className={`min-h-[42px] px-3 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 active:scale-95 transition ${
                      isSoldOut
                        ? 'bg-rose-50 text-rose-900 border-rose-300'
                        : isLow
                        ? 'bg-amber-50 text-amber-950 border-amber-300'
                        : 'bg-stone-100 hover:bg-amber-100 text-stone-800 border-stone-200'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{item.name}</span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isSoldOut
                          ? 'bg-rose-600 text-white'
                          : isLow
                          ? 'bg-amber-400 text-stone-950'
                          : 'bg-white text-stone-600'
                      }`}
                    >
                      {isSoldOut ? 'SOLD OUT' : `${remaining}/${cap} left`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Cap Exceeded Soft Warning */}
          {draftCapWarnings.length > 0 && (
            <div className="rounded-xl bg-rose-50 border border-rose-300 p-3 flex items-start gap-2 text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-extrabold">Daily Batch Cap Warning (Override Allowed):</p>
                {draftCapWarnings.map((w, i) => (
                  <p key={i} className="text-[11px]">
                    &bull; {w}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* EDITABLE DRAFT CONFIRMATION CARD */}
          <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                Parsed Draft Details
              </span>
              <span className="text-sm font-black text-stone-900">
                {formatCurrency(draftTotalAmount)}
              </span>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={draftOrder.customer_name}
                onChange={(e) =>
                  setDraftOrder((prev) => ({ ...prev, customer_name: e.target.value }))
                }
                placeholder="e.g. Ate Maria"
                className="w-full min-h-[44px] rounded-xl border border-stone-300 bg-white px-3 text-xs font-bold text-stone-900 focus:border-amber-500 outline-none"
              />
            </div>

            {/* Chunky Item List with 44px x 44px Steppers */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-stone-600">
                Order Items ({draftOrder.items.length})
              </label>

              {draftOrder.items.length === 0 ? (
                <div className="text-center py-4 px-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-400">
                  No items yet — paste a chat above or tap a menu chip.
                </div>
              ) : (
                <div className="space-y-2">
                  {draftOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-stone-200 p-2.5 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-stone-900 truncate">
                            {item.item_name}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {item.variant} &bull; {formatCurrency(item.unit_price)}
                          </p>
                        </div>

                        {/* Chunky 44px x 44px One-Thumb Quantity Steppers */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onUpdateDraftItemQty(item.id, -1)}
                            className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-900 font-black text-base flex items-center justify-center border border-stone-200"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-sm font-black text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateDraftItemQty(item.id, 1)}
                            className="w-11 h-11 rounded-xl bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-950 font-black text-base flex items-center justify-center border border-amber-300"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => onUpdateDraftItemNote(item.id, e.target.value)}
                        placeholder="Note (e.g. less sweet, no nuts)..."
                        className="w-full min-h-[36px] text-[11px] bg-stone-50 border border-stone-200 rounded-lg px-2.5 text-stone-700 placeholder:text-stone-400 focus:bg-white focus:border-amber-400 outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Date
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setDraftOrder((prev) => ({ ...prev, due_date: todayStr }))
                    }
                    className={`min-h-[44px] rounded-xl text-xs font-extrabold border transition ${
                      draftOrder.due_date === todayStr
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftOrder((prev) => ({ ...prev, due_date: tomorrowStr }))
                    }
                    className={`min-h-[44px] rounded-xl text-xs font-extrabold border transition ${
                      draftOrder.due_date === tomorrowStr
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={draftOrder.due_time}
                  onChange={(e) =>
                    setDraftOrder((prev) => ({ ...prev, due_time: e.target.value }))
                  }
                  className="w-full min-h-[44px] rounded-xl border border-stone-300 bg-white px-2.5 text-xs font-bold text-stone-900 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Fulfillment Toggle Pills */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Fulfillment
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['pickup', 'delivery', 'meetup'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setDraftOrder((prev) => ({ ...prev, fulfillment_type: type }))
                    }
                    className={`min-h-[44px] rounded-xl text-xs font-extrabold capitalize border transition ${
                      draftOrder.fulfillment_type === type
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {(draftOrder.fulfillment_type !== 'pickup' || draftOrder.delivery_address) && (
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {draftOrder.fulfillment_type === 'delivery'
                    ? 'Delivery Address / Landmark'
                    : 'Meetup Location'}
                </label>
                <input
                  type="text"
                  value={draftOrder.delivery_address}
                  onChange={(e) =>
                    setDraftOrder((prev) => ({ ...prev, delivery_address: e.target.value }))
                  }
                  placeholder="e.g. Tetuan Church Gate"
                  className="w-full min-h-[44px] rounded-xl border border-stone-300 bg-white px-3 text-xs font-medium text-stone-900 focus:border-amber-500 outline-none"
                />
              </div>
            )}

            {/* Payment Status & Channel */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Payment
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'unpaid' as const, label: 'Unpaid' },
                    { id: 'partial' as const, label: 'DP Paid' },
                    { id: 'paid' as const, label: 'Paid' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handlePaymentStatusChange(st.id)}
                      className={`min-h-[44px] rounded-xl text-[11px] font-extrabold border transition ${
                        draftOrder.payment_status === st.id
                          ? st.id === 'paid'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : st.id === 'partial'
                            ? 'bg-amber-400 text-stone-950 border-amber-500'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-stone-700 border-stone-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Channel
                </label>
                <select
                  value={draftOrder.payment_method}
                  onChange={(e) =>
                    setDraftOrder((prev) => ({ ...prev, payment_method: e.target.value }))
                  }
                  className="w-full min-h-[44px] rounded-xl border border-stone-300 bg-white px-2.5 text-xs font-bold text-stone-900 focus:border-amber-500 outline-none"
                >
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                  <option value="COD">COD</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>
            </div>

            {/* Partial Downpayment Quick-Split Controls + Remaining Balance Math */}
            {draftOrder.payment_status === 'partial' && (
              <div className="bg-white rounded-xl border border-amber-300 p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700">Downpayment Received (₱)</span>
                  <span className="font-extrabold text-rose-700">
                    Remaining Bal: {formatCurrency(draftRemainingBalance)}
                  </span>
                </div>

                <input
                  type="number"
                  min="0"
                  max={draftTotalAmount}
                  value={draftOrder.amount_paid}
                  onChange={(e) =>
                    setDraftOrder((prev) => ({
                      ...prev,
                      amount_paid: parseFloat(e.target.value) || 0
                    }))
                  }
                  className="w-full min-h-[44px] rounded-xl border border-amber-400 bg-amber-50/40 px-3 text-sm font-black text-stone-900 outline-none"
                />

                {/* Quick-Split Thumb Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setDraftOrder((prev) => ({
                        ...prev,
                        amount_paid: Math.round(draftTotalAmount / 2)
                      }))
                    }
                    className="min-h-[40px] rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-800 font-extrabold text-xs border border-stone-200 active:scale-95"
                  >
                    50% DP ({formatCurrency(Math.round(draftTotalAmount / 2))})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftOrder((prev) => ({
                        ...prev,
                        amount_paid: Math.min(draftTotalAmount, 200)
                      }))
                    }
                    className="min-h-[40px] rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-800 font-extrabold text-xs border border-stone-200 active:scale-95"
                  >
                    ₱200
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftOrder((prev) => ({
                        ...prev,
                        amount_paid: Math.min(draftTotalAmount, 500)
                      }))
                    }
                    className="min-h-[40px] rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-800 font-extrabold text-xs border border-stone-200 active:scale-95"
                  >
                    ₱500
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom Save CTA inside Sheet (Thumb Zone) */}
        <div className="p-4 bg-white border-t border-stone-200 shrink-0">
          <button
            type="button"
            onClick={onSaveOrder}
            disabled={draftOrder.items.length === 0}
            className="w-full min-h-[52px] rounded-2xl bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] transition"
          >
            <span>Save Order ({formatCurrency(draftTotalAmount)})</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
