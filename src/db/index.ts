import Dexie, { type Table } from 'dexie';
import type { Order, MenuItem, OrderItem, SyncMutation } from '../types';
import { DEFAULT_MENU_ITEMS, getInitialOrders } from '../data/sampleData';

export class BakeFlowDatabase extends Dexie {
  orders!: Table<Order, string>;
  order_items!: Table<OrderItem, string>;
  menu_items!: Table<MenuItem, string>;
  sync_queue!: Table<SyncMutation, string>;

  constructor() {
    super('BakeFlowLocalDB');
    this.version(1).stores({
      orders: 'id, order_code, due_date, payment_status, order_status, updated_at',
      order_items: 'id, order_id, menu_item_id, seller_id',
      menu_items: 'id, name, is_active, updated_at',
      sync_queue: 'id, table, created_at'
    });
  }
}

export const localDb = new BakeFlowDatabase();

// Seed initial demo data into IndexedDB on first load
export async function seedInitialDataIfEmpty(): Promise<void> {
  const orderCount = await localDb.orders.count();
  const menuCount = await localDb.menu_items.count();

  if (menuCount === 0) {
    await localDb.menu_items.bulkPut(
      DEFAULT_MENU_ITEMS.map((m) => ({
        ...m,
        updated_at: new Date().toISOString(),
        deleted_at: null
      }))
    );
  }

  if (orderCount === 0) {
    const initialOrders = getInitialOrders();
    await localDb.orders.bulkPut(
      initialOrders.map((o) => ({
        ...o,
        updated_at: new Date().toISOString(),
        deleted_at: null
      }))
    );

    const allItems: OrderItem[] = [];
    initialOrders.forEach((o) => {
      o.items.forEach((item) => {
        allItems.push({
          ...item,
          order_id: o.id,
          updated_at: new Date().toISOString(),
          deleted_at: null
        });
      });
    });
    if (allItems.length > 0) {
      await localDb.order_items.bulkPut(allItems);
    }
  }
}

// Helper to log a mutation for cloud sync
export async function queueMutation(
  table: 'orders' | 'order_items' | 'menu_items',
  action: 'upsert' | 'delete',
  data: any,
  isAuthenticated: boolean
): Promise<void> {
  if (!isAuthenticated) return; // Guests store locally without sync queue

  const mutation: SyncMutation = {
    id: `mut-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`,
    table,
    action,
    data: {
      ...data,
      updated_at: new Date().toISOString()
    },
    created_at: new Date().toISOString()
  };

  await localDb.sync_queue.put(mutation);
}
