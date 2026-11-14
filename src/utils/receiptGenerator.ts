import type { Order } from '../types';
import { formatCurrency, formatDisplayTime, SELLER_PAYMENT_INFO } from './formatters';

export function generateMessengerReceipt(order: Order, todayStr: string): string {
  const dateLabel = order.due_date === todayStr ? 'Today' : 'Tomorrow';
  const timeLabel = order.due_time ? ` at ${formatDisplayTime(order.due_time)}` : '';
  const fulfillLabel =
    order.fulfillment_type === 'delivery'
      ? `Delivery${order.delivery_address ? ` (${order.delivery_address})` : ''}`
      : order.fulfillment_type === 'meetup'
      ? `Meetup${order.delivery_address ? ` (${order.delivery_address})` : ''}`
      : 'Pickup';

  const itemsLines = order.items
    .map(
      (i) =>
        `• ${i.quantity}x ${i.item_name}${i.variant ? ` (${i.variant})` : ''} - ${formatCurrency(
          i.quantity * i.unit_price
        )}${i.notes ? ` [${i.notes}]` : ''}`
    )
    .join('\n');

  const balance = Math.max(0, order.total_amount - order.amount_paid);
  const paymentBlock =
    order.payment_status === 'paid'
      ? `✅ PAID IN FULL: ${formatCurrency(order.total_amount)} (${order.payment_method})`
      : order.payment_status === 'partial'
      ? `🟡 DP PAID: ${formatCurrency(order.amount_paid)} (${order.payment_method})\n🔴 REMAINING BALANCE: ${formatCurrency(balance)} (Due on ${order.fulfillment_type})`
      : `⏳ UNPAID: ${formatCurrency(order.total_amount)} (${order.payment_method})`;

  const receiptLines = [
    `Hi ${order.customer_name}! Confirmed order (${order.order_code}):`,
    ``,
    itemsLines,
    ``,
    `📅 ${dateLabel}${timeLabel} • ${fulfillLabel}`,
    `💰 Total: ${formatCurrency(order.total_amount)}`,
    paymentBlock
  ];

  if (order.payment_status !== 'paid') {
    receiptLines.push(``, `📲 ${SELLER_PAYMENT_INFO}`);
  }

  receiptLines.push(``, `Salamat po! 🧁`);
  return receiptLines.join('\n');
}

export function generatePaymentReminder(order: Order, todayStr: string): string {
  const balance = Math.max(0, order.total_amount - order.amount_paid);
  const timeLabel = order.due_time ? ` (${formatDisplayTime(order.due_time)})` : '';
  const balanceContext =
    order.payment_status === 'partial'
      ? `remaining balance of ${formatCurrency(balance)} (after your ${formatCurrency(order.amount_paid)} DP)`
      : `total of ${formatCurrency(balance)}`;

  return [
    `Hi ${order.customer_name}! Friendly reminder on your BakeFlow order (${order.order_code}) for ${
      order.due_date === todayStr ? 'today' : 'tomorrow'
    }${timeLabel}.`,
    ``,
    `Your ${balanceContext} is ready for settlement via ${order.payment_method}.`,
    `📲 ${SELLER_PAYMENT_INFO}`,
    ``,
    `Please send a screenshot once sent so we can dispatch/release smoothly. Salamat po! 🧁`
  ].join('\n');
}

export function generateRiderDetails(order: Order, todayStr: string): string {
  const balanceToCollect = Math.max(0, order.total_amount - order.amount_paid);
  const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ');

  return [
    `🛵 RIDER HANDOFF (${order.order_code})`,
    `Receiver: ${order.customer_name}`,
    `Drop-off / Landmark: ${order.delivery_address || 'Ask customer pin'}`,
    `Schedule: ${order.due_date === todayStr ? 'Today' : 'Tomorrow'} ${formatDisplayTime(order.due_time)}`,
    `Items: ${itemsSummary}`,
    balanceToCollect > 0
      ? `💵 COLLECT FROM RECEIVER: ${formatCurrency(balanceToCollect)} (${order.payment_method})`
      : `✅ ALREADY PAID IN FULL (No cash collection)`
  ].join('\n');
}
