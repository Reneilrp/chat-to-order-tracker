import type { MenuItem, Order, SampleChat } from '../types';
import { getRelativeDateStr } from '../utils/formatters';

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Classic Fudge Brownies',
    variant: 'Box of 6',
    unit_price: 220,
    dailyCap: 15,
    keywords: ['classic brownie', 'classic brownies', 'brownies', 'brownie', 'fudge']
  },
  {
    id: 'menu-2',
    name: 'Ube Cheese Pandesal',
    variant: 'Pack of 8',
    unit_price: 180,
    dailyCap: 20,
    keywords: ['ube pandesal', 'ube cheese', 'pandesal', 'ube']
  },
  {
    id: 'menu-3',
    name: 'Chocolate Moist Cake',
    variant: 'Solo Tub',
    unit_price: 250,
    dailyCap: 14,
    keywords: ['choco moist', 'chocolate moist', 'moist cake', 'choco cake', 'choco']
  },
  {
    id: 'menu-4',
    name: 'Burnt Basque Cheesecake',
    variant: '6-inch Whole',
    unit_price: 550,
    dailyCap: 6,
    keywords: ['basque', 'cheesecake', 'burnt basque', 'bbc']
  },
  {
    id: 'menu-5',
    name: 'Red Velvet Crinkles',
    variant: 'Jar of 12',
    unit_price: 280,
    dailyCap: 12,
    keywords: ['red velvet', 'crinkles', 'rv', 'velvet']
  }
];

export const SAMPLE_CHATS: SampleChat[] = [
  {
    label: 'Multi-Msg Thread + DP',
    text: `4:12 PM
You sent: Yes po available pa for today!
Carlo Santos sent:
ate pa-order 3 boxes classic brownies (no nuts)
2 tubs choco moist less sweet
deliver sa Tetuan Church Gate today 5pm
500 dp gcash sent na po`
  },
  {
    label: 'Pahabol Add-on (Katrina)',
    text: 'Katrina Gomez: ate pahabol 1 jar red velvet crinkles + 1 ube cheese pandesal sa order ko kanina today'
  },
  {
    label: 'Pickup Unpaid (Tomorrow)',
    text: 'Ate Maria: 4 boxes classic brownies + 2 ube pandesal bukas 4pm pickup gcash later'
  },
  {
    label: 'Cheesecake COD (Today)',
    text: 'Camille Tan po. 2 burnt basque cheesecake + 1 red velvet crinkles today 6pm delivery @ Pasonanca Park, COD'
  }
];

export const getInitialOrders = (): Order[] => {
  const today = getRelativeDateStr(0);
  const tomorrow = getRelativeDateStr(1);
  return [
    {
      id: 'ord-init-1',
      order_code: 'ORD-101',
      customer_name: 'Katrina Gomez',
      fulfillment_type: 'pickup',
      delivery_address: 'Kitchen Gate Pickup',
      due_date: today,
      due_time: '15:00',
      payment_status: 'paid',
      payment_method: 'GCash',
      amount_paid: 1020,
      total_amount: 1020,
      order_status: 'prepping',
      raw_chat_snippet: 'Katrina Gomez - 3 boxes classic brownies & 2 ube pandesal today 3pm pickup, paid GCash!',
      items: [
        { id: 'i-1', menu_item_id: 'menu-1', item_name: 'Classic Fudge Brownies', variant: 'Box of 6', quantity: 3, unit_price: 220, notes: '' },
        { id: 'i-2', menu_item_id: 'menu-2', item_name: 'Ube Cheese Pandesal', variant: 'Pack of 8', quantity: 2, unit_price: 180, notes: 'warm pack' }
      ]
    },
    {
      id: 'ord-init-2',
      order_code: 'ORD-102',
      customer_name: 'Marco Mendoza',
      fulfillment_type: 'delivery',
      delivery_address: 'Canelar, near Barangay Hall',
      due_date: today,
      due_time: '17:00',
      payment_status: 'partial',
      payment_method: 'GCash',
      amount_paid: 500,
      total_amount: 1050,
      order_status: 'pending',
      raw_chat_snippet: 'Marco Mendoza po, 1 burnt basque cheesecake + 2 tubs choco moist today 5pm delivery Canelar, 500 dp gcash',
      items: [
        { id: 'i-3', menu_item_id: 'menu-4', item_name: 'Burnt Basque Cheesecake', variant: '6-inch Whole', quantity: 1, unit_price: 550, notes: 'add birthday topper' },
        { id: 'i-4', menu_item_id: 'menu-3', item_name: 'Chocolate Moist Cake', variant: 'Solo Tub', quantity: 2, unit_price: 250, notes: 'less sweet' }
      ]
    },
    {
      id: 'ord-init-3',
      order_code: 'ORD-103',
      customer_name: 'Bianca Soriano',
      fulfillment_type: 'pickup',
      delivery_address: '',
      due_date: today,
      due_time: '18:00',
      payment_status: 'unpaid',
      payment_method: 'COD',
      amount_paid: 0,
      total_amount: 1600,
      order_status: 'ready',
      raw_chat_snippet: 'Bianca Soriano - 6 classic brownies + 1 red velvet crinkles today 6pm pickup COD',
      items: [
        { id: 'i-5', menu_item_id: 'menu-1', item_name: 'Classic Fudge Brownies', variant: 'Box of 6', quantity: 6, unit_price: 220, notes: '' },
        { id: 'i-6', menu_item_id: 'menu-5', item_name: 'Red Velvet Crinkles', variant: 'Jar of 12', quantity: 1, unit_price: 280, notes: '' }
      ]
    },
    {
      id: 'ord-init-4',
      order_code: 'ORD-104',
      customer_name: 'Sofia Villanueva',
      fulfillment_type: 'delivery',
      delivery_address: 'Pasonanca Park Gate',
      due_date: tomorrow,
      due_time: '10:30',
      payment_status: 'partial',
      payment_method: 'Maya',
      amount_paid: 300,
      total_amount: 620,
      order_status: 'pending',
      raw_chat_snippet: 'Sofia Villanueva - 2 classic brownies + 1 ube cheese pandesal bukas 10:30am delivery Pasonanca, DP 300 Maya',
      items: [
        { id: 'i-7', menu_item_id: 'menu-1', item_name: 'Classic Fudge Brownies', variant: 'Box of 6', quantity: 2, unit_price: 220, notes: 'no nuts' },
        { id: 'i-8', menu_item_id: 'menu-2', item_name: 'Ube Cheese Pandesal', variant: 'Pack of 8', quantity: 1, unit_price: 180, notes: '' }
      ]
    }
  ];
};
