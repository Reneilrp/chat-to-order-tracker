export interface MenuItem {
  id: string;
  seller_id?: string;
  name: string;
  variant: string;
  unit_price: number;
  dailyCap?: number;
  keywords: string[];
  is_active?: boolean;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface OrderItem {
  id: string;
  seller_id?: string;
  order_id?: string;
  menu_item_id?: string;
  item_name: string;
  variant?: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export type FulfillmentType = 'pickup' | 'delivery' | 'meetup';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type OrderStatus = 'pending' | 'prepping' | 'ready' | 'completed' | 'cancelled';
export type DateFilterType = 'today' | 'tomorrow';
export type StatusFilterType = 'all' | 'unpaid' | 'active' | 'done';
export type ActiveTabType = 'orders' | 'prep' | 'menu';

export interface Order {
  id: string;
  seller_id?: string;
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
  updated_at?: string;
  deleted_at?: string | null;
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

// ==========================================
// AUTH & SYNC ENGINE TYPES
// ==========================================

export interface SellerProfile {
  id: string;
  shop_name: string;
  currency_symbol: string;
  payment_instructions?: string | null;
}

export interface UserProfile {
  id: string;
  seller_id: string;
  name: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  seller: SellerProfile | null;
  isGuest: boolean;
}

export interface SyncMutation {
  id: string;
  table: 'orders' | 'order_items' | 'menu_items';
  action: 'upsert' | 'delete';
  data: any;
  created_at: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error' | 'synced';
