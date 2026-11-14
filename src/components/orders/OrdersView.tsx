import React from 'react';
import { Search, MessageSquare } from 'lucide-react';
import type { Order, StatusFilterType } from '../../types';
import { OrderCard } from './OrderCard';

interface OrdersViewProps {
  orders: Order[];
  statusFilter: StatusFilterType;
  setStatusFilter: (filter: StatusFilterType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  copiedFeedback: string | null;
  onAdvanceStatus: (id: string) => void;
  onDeleteOrder: (id: string) => void;
  onOpenPaymentModal: (order: Order) => void;
  onCopyReceipt: (order: Order) => void;
  onCopyReminder: (order: Order) => void;
  onCopyRider: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  copiedFeedback,
  onAdvanceStatus,
  onDeleteOrder,
  onOpenPaymentModal,
  onCopyReceipt,
  onCopyReminder,
  onCopyRider
}) => {
  const filterChips: { id: StatusFilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unpaid', label: 'Unpaid / DP' },
    { id: 'active', label: 'In Progress' },
    { id: 'done', label: 'Done' }
  ];

  return (
    <>
      {/* Horizontal Status Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {filterChips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setStatusFilter(chip.id)}
            className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
              statusFilter === chip.id
                ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-2xs'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Compact Search Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customer, #code, or brownie/cake..."
          className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:border-amber-500 outline-none"
        />
      </div>

      {/* Order Cards List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2 mt-2">
          <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-700">No orders in this filter</p>
          <p className="text-xs text-stone-500">
            Tap <span className="font-bold text-amber-700">+ Paste Chat / Order</span> below to log a DM.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              copiedFeedback={copiedFeedback}
              onAdvanceStatus={onAdvanceStatus}
              onDeleteOrder={onDeleteOrder}
              onOpenPaymentModal={onOpenPaymentModal}
              onCopyReceipt={onCopyReceipt}
              onCopyReminder={onCopyReminder}
              onCopyRider={onCopyRider}
            />
          ))}
        </div>
      )}
    </>
  );
};
