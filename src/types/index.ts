export interface MenuItem {
  id: string;
  name: string;
  variant: string;
  unit_price: number;
  dailyCap?: number;
  keywords: string[];
}

export interface OrderItem {
  id: string;
  menu_item_id?: string;
  item_name: string;
  variant?: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export type FulfillmentType = 'pickup' | 'delivery' | 'meetup';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type OrderStatus = 'pending' | 'prepping' | 'ready' | 'completed' | 'cancelled';
export type DateFilterType = 'today' | 'tomorrow';
export type StatusFilterType = 'all' | 'unpaid' | 'active' | 'done';
export type ActiveTabType = 'orders' | 'prep' | 'menu';

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  fulfillment_type: FulfillmentType;
  delivery_address: string;
  due_date: string; // YYYY-MM-DD
  due_time?: string; // HH:mm
  payment_status: PaymentStatus;
  payment_method: string;
  amount_paid: number;
  total_amount: number;
  order_status: OrderStatus;
  raw_chat_snippet: string;
  items: OrderItem[];
}

export interface DraftOrder {
  customer_name: string;
  fulfillment_type: FulfillmentType;
  delivery_address: string;
  due_date: string;
  due_time: string;
  payment_status: PaymentStatus;
  payment_method: string;
  amount_paid: number;
  total_amount: number;
  raw_chat_snippet: string;
  is_append_intent?: boolean;
  items: OrderItem[];
}

export interface CashSummary {
  grossBooked: number;
  totalCollected: number;
  cashCodCollected: number;
  ewalletCollected: number;
  uncollected: number;
  completedOrdersCount: number;
  activeOrdersCount: number;
}

export interface KitchenPrepBatch {
  key: string;
  menu_item_id?: string;
  item_name: string;
  variant?: string;
  total_qty: number;
  dailyCap: number | null;
  totalBookedDay: number;
  notes: string[];
}

export interface SampleChat {
  label: string;
  text: string;
}
