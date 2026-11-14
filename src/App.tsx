import React, { useState, useEffect, useMemo } from 'react';
import type {
  Order,
  MenuItem,
  ActiveTabType,
  DateFilterType,
  StatusFilterType,
  DraftOrder,
  CashSummary,
  KitchenPrepBatch
} from './types';
import {
  getRelativeDateStr,
  generateId,
  copyToClipboardSafe
} from './utils/formatters';
import {
  DEFAULT_MENU_ITEMS,
  SAMPLE_CHATS,
  getInitialOrders
} from './data/sampleData';
import { parseChatToDraft } from './parser/chatParser';
import {
  generateMessengerReceipt,
  generatePaymentReminder,
  generateRiderDetails
} from './utils/receiptGenerator';

import { Toast } from './components/common/Toast';
import { Header } from './components/header/Header';
import { OrdersView } from './components/orders/OrdersView';
import { KitchenPrepView } from './components/prep/KitchenPrepView';
import { MenuManager } from './components/menu/MenuManager';
import { IntakeDrawer } from './components/modals/IntakeDrawer';
import { PaymentModal } from './components/modals/PaymentModal';
import { DailyTallySheet } from './components/modals/DailyTallySheet';
import { BottomNav } from './components/navigation/BottomNav';
import { FloatingIntakeButton } from './components/navigation/FloatingIntakeButton';

export default function App() {
  const todayStr = getRelativeDateStr(0);
  const tomorrowStr = getRelativeDateStr(1);

  // Persistent State: Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('bakeflow_mobile_orders_v2');
      return saved ? JSON.parse(saved) : getInitialOrders();
    } catch {
      return getInitialOrders();
    }
  });

  // Persistent State: Menu Catalog (with dailyCap)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('bakeflow_mobile_menu_v2');
      return saved ? JSON.parse(saved) : DEFAULT_MENU_ITEMS;
    } catch {
      return DEFAULT_MENU_ITEMS;
    }
  });

  // Persistent State: Kitchen Prep Check-Offs
  const [checkedPrepKeys, setCheckedPrepKeys] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bakeflow_mobile_prep_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bakeflow_mobile_orders_v2', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('bakeflow_mobile_menu_v2', JSON.stringify(menuItems));
    } catch (e) {
      console.error(e);
    }
  }, [menuItems]);

  useEffect(() => {
    try {
      localStorage.setItem('bakeflow_mobile_prep_v2', JSON.stringify(checkedPrepKeys));
    } catch (e) {
      console.error(e);
    }
  }, [checkedPrepKeys]);

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<ActiveTabType>('orders');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers States
  const [isIntakeSheetOpen, setIsIntakeSheetOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);
  const [parseLatencyMs, setParseLatencyMs] = useState<number | null>(null);
  const [dismissedAppendOrderId, setDismissedAppendOrderId] = useState<string | null>(null);

  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [isTallySheetOpen, setIsTallySheetOpen] = useState(false);

  // Draft Order State
  const [draftOrder, setDraftOrder] = useState<DraftOrder>({
    customer_name: '',
    fulfillment_type: 'pickup',
    delivery_address: '',
    due_date: todayStr,
    due_time: '',
    payment_status: 'unpaid',
    payment_method: 'GCash',
    amount_paid: 0,
    total_amount: 0,
    raw_chat_snippet: '',
    items: []
  });

  // Feedback States
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const copyWithToast = (text: string, feedbackKey: string, toastText: string) => {
    copyToClipboardSafe(text, () => {
      setCopiedFeedback(feedbackKey);
      showToast(toastText);
      setTimeout(() => setCopiedFeedback(null), 2200);
    });
  };

  // ==========================================================================
  // DERIVED SELECTORS
  // ==========================================================================

  const targetDateStr = dateFilter === 'today' ? todayStr : tomorrowStr;

  const todayOrderCount = useMemo(
    () => orders.filter((o) => o.due_date === todayStr && o.order_status !== 'cancelled').length,
    [orders, todayStr]
  );

  const tomorrowOrderCount = useMemo(
    () => orders.filter((o) => o.due_date === tomorrowStr && o.order_status !== 'cancelled').length,
    [orders, tomorrowStr]
  );

  const ordersForSelectedDate = useMemo(() => {
    return orders.filter((o) => o.due_date === targetDateStr && o.order_status !== 'cancelled');
  }, [orders, targetDateStr]);

  const getBookedQtyMapForDate = (dateStr: string) => {
    const map: Record<string, number> = {};
    orders
      .filter((o) => o.due_date === dateStr && o.order_status !== 'cancelled')
      .forEach((order) => {
        order.items.forEach((item) => {
          if (item.menu_item_id) {
            map[item.menu_item_id] = (map[item.menu_item_id] || 0) + item.quantity;
          }
          map[item.item_name] = (map[item.item_name] || 0) + item.quantity;
        });
      });
    return map;
  };

  const bookedQtySelectedDate = useMemo(
    () => getBookedQtyMapForDate(targetDateStr),
    [orders, targetDateStr]
  );

  const bookedQtyDraftDate = useMemo(
    () => getBookedQtyMapForDate(draftOrder.due_date || targetDateStr),
    [orders, draftOrder.due_date, targetDateStr]
  );

  const cashSummary = useMemo<CashSummary>(() => {
    let grossBooked = 0;
    let totalCollected = 0;
    let cashCodCollected = 0;
    let ewalletCollected = 0;
    let completedOrdersCount = 0;
    let activeOrdersCount = 0;

    ordersForSelectedDate.forEach((o) => {
      grossBooked += o.total_amount;
      totalCollected += o.amount_paid;
      if (o.payment_method === 'COD' || o.payment_method === 'Cash') {
        cashCodCollected += o.amount_paid;
      } else {
        ewalletCollected += o.amount_paid;
      }

      if (o.order_status === 'completed') completedOrdersCount += 1;
      else activeOrdersCount += 1;
    });

    const uncollected = Math.max(0, grossBooked - totalCollected);

    return {
      grossBooked,
      totalCollected,
      cashCodCollected,
      ewalletCollected,
      uncollected,
      completedOrdersCount,
      activeOrdersCount
    };
  }, [ordersForSelectedDate]);

  const kitchenPrepList = useMemo<KitchenPrepBatch[]>(() => {
    const activeOrders = ordersForSelectedDate.filter((o) => o.order_status !== 'completed');
    const grouped: Record<string, KitchenPrepBatch> = {};

    activeOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = `${item.item_name}__${item.variant || ''}`;
        if (!grouped[key]) {
          const matchedMenu = menuItems.find(
            (m) => m.id === item.menu_item_id || m.name === item.item_name
          );
          grouped[key] = {
            key,
            menu_item_id: item.menu_item_id,
            item_name: item.item_name,
            variant: item.variant,
            total_qty: 0,
            dailyCap: matchedMenu?.dailyCap || null,
            totalBookedDay:
              (item.menu_item_id && bookedQtySelectedDate[item.menu_item_id]) ||
              bookedQtySelectedDate[item.item_name] ||
              0,
            notes: []
          };
        }
        grouped[key].total_qty += item.quantity;
        if (item.notes && item.notes.trim()) {
          grouped[key].notes.push(`${item.quantity}x ${item.notes.trim()} (${order.customer_name})`);
        }
      });
    });

    return Object.values(grouped).sort((a, b) => b.total_qty - a.total_qty);
  }, [ordersForSelectedDate, menuItems, bookedQtySelectedDate]);

  const prepProgress = useMemo(() => {
    const total = kitchenPrepList.length;
    const completed = kitchenPrepList.filter(
      (b) => !checkedPrepKeys[`${targetDateStr}_${b.key}`]
    ).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [kitchenPrepList, checkedPrepKeys, targetDateStr]);

  const visibleOrders = useMemo(() => {
    return ordersForSelectedDate.filter((order) => {
      if (statusFilter === 'unpaid' && order.payment_status === 'paid') return false;
      if (statusFilter === 'active' && order.order_status === 'completed') return false;
      if (statusFilter === 'done' && order.order_status !== 'completed') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = order.customer_name.toLowerCase().includes(q);
        const matchCode = order.order_code.toLowerCase().includes(q);
        const matchItem = order.items.some((i) => i.item_name.toLowerCase().includes(q));
        return matchName || matchCode || matchItem;
      }
      return true;
    });
  }, [ordersForSelectedDate, statusFilter, searchQuery]);

  const matchingExistingOrder = useMemo(() => {
    const name = draftOrder.customer_name.trim().toLowerCase();
    if (name.length < 3) return null;

    const found = orders.find(
      (o) =>
        o.due_date === (draftOrder.due_date || targetDateStr) &&
        o.order_status !== 'cancelled' &&
        o.order_status !== 'completed' &&
        o.customer_name.toLowerCase().includes(name)
    );

    if (!found || found.id === dismissedAppendOrderId) return null;
    return found;
  }, [draftOrder.customer_name, draftOrder.due_date, orders, targetDateStr, dismissedAppendOrderId]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const openIntakeDrawer = () => {
    setClipboardNotice(null);
    setDismissedAppendOrderId(null);
    setDraftOrder((prev) => ({
      ...prev,
      due_date: targetDateStr
    }));
    setIsIntakeSheetOpen(true);
  };

  const resetDraftState = () => {
    setChatInput('');
    setParseLatencyMs(null);
    setDismissedAppendOrderId(null);
    setDraftOrder({
      customer_name: '',
      fulfillment_type: 'pickup',
      delivery_address: '',
      due_date: targetDateStr,
      due_time: '',
      payment_status: 'unpaid',
      payment_method: 'GCash',
      amount_paid: 0,
      total_amount: 0,
      raw_chat_snippet: '',
      items: []
    });
  };

  const handleChatTextChange = (text: string) => {
    setChatInput(text);
    setClipboardNotice(null);
    setDismissedAppendOrderId(null);
    if (!text.trim()) {
      setParseLatencyMs(null);
      return;
    }
    const start = performance.now();
    const parsed = parseChatToDraft(text, menuItems);
    const elapsed = Math.max(1, Math.round(performance.now() - start));
    setParseLatencyMs(elapsed);

    if (parsed) {
      setDraftOrder(parsed);
    }
  };

  const handleOneTapPasteClipboard = async () => {
    setClipboardNotice(null);
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim()) {
          handleChatTextChange(clipText);
          showToast('Pasted & parsed from clipboard!');
        } else {
          setClipboardNotice('Clipboard is empty. Copy a Messenger chat first or tap a sample pill below.');
        }
      } else {
        setClipboardNotice('Browser blocked auto-paste. Long-press the box below or tap a sample DM.');
      }
    } catch {
      setClipboardNotice('Clipboard access blocked in preview iframe — tap a sample DM pill or paste manually below.');
    }
  };

  const handleQuickAddMenuItem = (menuItem: MenuItem) => {
    setDraftOrder((prev) => {
      const existingIdx = prev.items.findIndex((i) => i.menu_item_id === menuItem.id);
      let updatedItems;
      if (existingIdx > -1) {
        updatedItems = prev.items.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedItems = [
          ...prev.items,
          {
            id: generateId(),
            menu_item_id: menuItem.id,
            item_name: menuItem.name,
            variant: menuItem.variant,
            quantity: 1,
            unit_price: menuItem.unit_price,
            notes: ''
          }
        ];
      }
      const newTotal = updatedItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
      return {
        ...prev,
        items: updatedItems,
        total_amount: newTotal,
        amount_paid: prev.payment_status === 'paid' ? newTotal : prev.amount_paid
      };
    });
  };

  const updateDraftItemQty = (itemId: string, delta: number) => {
    setDraftOrder((prev) => {
      const updatedItems = prev.items
        .map((item) => (item.id === itemId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0);
      const newTotal = updatedItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
      return {
        ...prev,
        items: updatedItems,
        total_amount: newTotal,
        amount_paid: prev.payment_status === 'paid' ? newTotal : prev.amount_paid
      };
    });
  };

  const updateDraftItemNote = (itemId: string, note: string) => {
    setDraftOrder((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, notes: note } : item))
    }));
  };

  const draftTotalAmount = useMemo(() => {
    return draftOrder.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  }, [draftOrder.items]);

  const draftRemainingBalance = Math.max(
    0,
    draftTotalAmount - (Number(draftOrder.amount_paid) || 0)
  );

  const draftCapWarnings = useMemo(() => {
    const warnings: string[] = [];
    draftOrder.items.forEach((draftItem) => {
      const menuMeta = menuItems.find(
        (m) => m.id === draftItem.menu_item_id || m.name === draftItem.item_name
      );
      if (menuMeta && menuMeta.dailyCap) {
        const alreadyBooked = bookedQtyDraftDate[menuMeta.id] || 0;
        const projected = alreadyBooked + draftItem.quantity;
        if (projected > menuMeta.dailyCap) {
          warnings.push(
            `${menuMeta.name}: ${projected}/${menuMeta.dailyCap} booked (exceeds cap by ${
              projected - menuMeta.dailyCap
            })`
          );
        }
      }
    });
    return warnings;
  }, [draftOrder.items, menuItems, bookedQtyDraftDate]);

  const handleAppendToExistingOrder = () => {
    if (!matchingExistingOrder) return;
    if (draftOrder.items.length === 0) {
      showToast('Add at least 1 item to append.');
      return;
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== matchingExistingOrder.id) return ord;

        const mergedItems = [...ord.items];
        draftOrder.items.forEach((newItem) => {
          const existingIdx = mergedItems.findIndex(
            (i) => i.item_name === newItem.item_name && (i.notes || '') === (newItem.notes || '')
          );
          if (existingIdx > -1) {
            mergedItems[existingIdx] = {
              ...mergedItems[existingIdx],
              quantity: mergedItems[existingIdx].quantity + newItem.quantity
            };
          } else {
            mergedItems.push({ ...newItem, id: generateId() });
          }
        });

        const updatedTotal = mergedItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
        const updatedPaid = ord.amount_paid + (Number(draftOrder.amount_paid) || 0);
        const cappedPaid = Math.min(updatedTotal, updatedPaid);
        const updatedPaymentStatus =
          cappedPaid >= updatedTotal ? 'paid' : cappedPaid > 0 ? 'partial' : 'unpaid';

        return {
          ...ord,
          items: mergedItems,
          total_amount: updatedTotal,
          amount_paid: cappedPaid,
          payment_status: updatedPaymentStatus,
          raw_chat_snippet: [ord.raw_chat_snippet, chatInput.trim()].filter(Boolean).join('\n+ ')
        };
      })
    );

    if (matchingExistingOrder.due_date === tomorrowStr) setDateFilter('tomorrow');
    else setDateFilter('today');

    setActiveTab('orders');
    setIsIntakeSheetOpen(false);
    showToast(`Added items to ${matchingExistingOrder.order_code} (${matchingExistingOrder.customer_name})!`);
    resetDraftState();
  };

  const handleSaveDraftOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (draftOrder.items.length === 0) {
      showToast('Tap at least 1 item to add.');
      return;
    }

    const nextNumber = 101 + orders.length;
    const finalTotal = draftTotalAmount;
    const finalPaid =
      draftOrder.payment_status === 'paid'
        ? finalTotal
        : draftOrder.payment_status === 'unpaid'
        ? 0
        : Math.min(finalTotal, Number(draftOrder.amount_paid) || 0);

    const normalizedPaymentStatus =
      finalPaid >= finalTotal && finalTotal > 0
        ? 'paid'
        : finalPaid > 0
        ? 'partial'
        : 'unpaid';

    const newOrder: Order = {
      id: `ord-${generateId()}`,
      order_code: `ORD-${nextNumber}`,
      customer_name: draftOrder.customer_name.trim() || 'DM Customer',
      fulfillment_type: draftOrder.fulfillment_type,
      delivery_address: draftOrder.delivery_address.trim(),
      due_date: draftOrder.due_date || todayStr,
      due_time: draftOrder.due_time || '',
      payment_status: normalizedPaymentStatus,
      payment_method: draftOrder.payment_method,
      amount_paid: finalPaid,
      total_amount: finalTotal,
      order_status: 'pending',
      raw_chat_snippet: chatInput.trim(),
      items: draftOrder.items
    };

    setOrders((prev) => [newOrder, ...prev]);

    if (newOrder.due_date === tomorrowStr) {
      setDateFilter('tomorrow');
    } else {
      setDateFilter('today');
    }
    setActiveTab('orders');
    setIsIntakeSheetOpen(false);
    resetDraftState();

    showToast(`Saved ${newOrder.order_code} (${newOrder.customer_name})`);
  };

  const handleApplyPaymentUpdate = (
    orderId: string,
    mode: 'paid' | 'unpaid' | 'partial',
    dpAmount?: number,
    method?: string
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        if (mode === 'paid') {
          showToast(`${order.order_code} marked PAID`);
          return {
            ...order,
            payment_status: 'paid',
            payment_method: method || order.payment_method,
            amount_paid: order.total_amount
          };
        }

        if (mode === 'unpaid') {
          showToast(`${order.order_code} reset to UNPAID`);
          return {
            ...order,
            payment_status: 'unpaid',
            payment_method: method || order.payment_method,
            amount_paid: 0
          };
        }

        // partial
        const parsed = Math.max(0, Math.min(order.total_amount, dpAmount || 0));
        const status =
          parsed >= order.total_amount ? 'paid' : parsed > 0 ? 'partial' : 'unpaid';
        showToast(`Updated payment for ${order.order_code}`);
        return {
          ...order,
          payment_status: status,
          payment_method: method || order.payment_method,
          amount_paid: parsed
        };
      })
    );
    setPaymentModalOrder(null);
  };

  const advanceOrderStatus = (orderId: string) => {
    const flow: Order['order_status'][] = ['pending', 'prepping', 'ready', 'completed'];
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const idx = flow.indexOf(order.order_status);
        const nextStatus = idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : 'pending';
        return { ...order, order_status: nextStatus };
      })
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast('Order deleted.');
  };

  const togglePrepCheck = (prepKey: string) => {
    const scopeKey = `${targetDateStr}_${prepKey}`;
    setCheckedPrepKeys((prev) => ({
      ...prev,
      [scopeKey]: !prev[scopeKey]
    }));
  };

  const handleResetDemo = () => {
    setOrders(getInitialOrders());
    setMenuItems(DEFAULT_MENU_ITEMS);
    setCheckedPrepKeys({});
    setDateFilter('today');
    setStatusFilter('all');
    setActiveTab('orders');
    showToast('Demo data reset!');
  };

  return (
    <div className="min-h-screen bg-stone-200/80 flex justify-center font-sans text-stone-900 selection:bg-amber-200">
      <div className="w-full max-w-md min-h-screen bg-stone-50 shadow-2xl border-x border-stone-200 flex flex-col relative overflow-x-clip">
        {/* Floating Toast Notification */}
        <Toast message={toastMessage} />

        {/* 1. Header & Quick Glanceable Metrics */}
        <Header
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          todayOrderCount={todayOrderCount}
          tomorrowOrderCount={tomorrowOrderCount}
          cashSummary={cashSummary}
          onResetDemo={handleResetDemo}
          onOpenTally={() => setIsTallySheetOpen(true)}
        />

        {/* 2. Main Content Views */}
        <main className="flex-1 px-4 pt-3.5 pb-36 space-y-3.5">
          {activeTab === 'orders' && (
            <OrdersView
              orders={visibleOrders}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              copiedFeedback={copiedFeedback}
              onAdvanceStatus={advanceOrderStatus}
              onDeleteOrder={deleteOrder}
              onOpenPaymentModal={(ord) => setPaymentModalOrder(ord)}
              onCopyReceipt={(ord) =>
                copyWithToast(
                  generateMessengerReceipt(ord, todayStr),
                  `${ord.id}_receipt`,
                  `Copied receipt for ${ord.customer_name}!`
                )
              }
              onCopyReminder={(ord) =>
                copyWithToast(
                  generatePaymentReminder(ord, todayStr),
                  `${ord.id}_reminder`,
                  `Copied payment reminder!`
                )
              }
              onCopyRider={(ord) =>
                copyWithToast(
                  generateRiderDetails(ord, todayStr),
                  `${ord.id}_rider`,
                  `Copied rider handoff block!`
                )
              }
            />
          )}

          {activeTab === 'prep' && (
            <KitchenPrepView
              dateFilter={dateFilter}
              kitchenPrepList={kitchenPrepList}
              prepProgress={prepProgress}
              checkedPrepKeys={checkedPrepKeys}
              targetDateStr={targetDateStr}
              onTogglePrepCheck={togglePrepCheck}
            />
          )}

          {activeTab === 'menu' && (
            <MenuManager
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              bookedQtySelectedDate={bookedQtySelectedDate}
              dateFilter={dateFilter}
              todayStr={todayStr}
              orders={orders}
              setOrders={setOrders}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* 3. Floating Intake CTA Button */}
        <FloatingIntakeButton onOpen={openIntakeDrawer} />

        {/* 4. Bottom Tab Navigation */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          orderCount={ordersForSelectedDate.length}
          prepCount={kitchenPrepList.length}
        />

        {/* 5. Slide-up Intake Drawer */}
        <IntakeDrawer
          isOpen={isIntakeSheetOpen}
          onClose={() => setIsIntakeSheetOpen(false)}
          chatInput={chatInput}
          setChatInput={handleChatTextChange}
          parseLatencyMs={parseLatencyMs}
          clipboardNotice={clipboardNotice}
          onPasteClipboard={handleOneTapPasteClipboard}
          sampleChats={SAMPLE_CHATS}
          onSelectSampleChat={handleChatTextChange}
          matchingExistingOrder={matchingExistingOrder}
          onAppendToExistingOrder={handleAppendToExistingOrder}
          onDismissAppend={() =>
            matchingExistingOrder && setDismissedAppendOrderId(matchingExistingOrder.id)
          }
          menuItems={menuItems}
          bookedQtyDraftDate={bookedQtyDraftDate}
          onQuickAddMenuItem={handleQuickAddMenuItem}
          draftOrder={draftOrder}
          setDraftOrder={setDraftOrder}
          onUpdateDraftItemQty={updateDraftItemQty}
          onUpdateDraftItemNote={updateDraftItemNote}
          draftTotalAmount={draftTotalAmount}
          draftRemainingBalance={draftRemainingBalance}
          draftCapWarnings={draftCapWarnings}
          todayStr={todayStr}
          tomorrowStr={tomorrowStr}
          onSaveOrder={handleSaveDraftOrder}
        />

        {/* 6. Payment / Downpayment Popover Modal */}
        <PaymentModal
          order={paymentModalOrder}
          onClose={() => setPaymentModalOrder(null)}
          onApplyPayment={handleApplyPaymentUpdate}
        />

        {/* 7. End-of-Day Cash & Sales Tally Sheet */}
        <DailyTallySheet
          isOpen={isTallySheetOpen}
          onClose={() => setIsTallySheetOpen(false)}
          dateFilter={dateFilter}
          cashSummary={cashSummary}
          onExportBackup={() => {
            const payload = {
              exported_at: new Date().toISOString(),
              app: 'BakeFlow PWA',
              orders,
              menuItems
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], {
              type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bakeflow-backup-${todayStr}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('Downloaded JSON backup!');
          }}
        />
      </div>
    </div>
  );
}
