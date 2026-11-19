import type { MenuItem, OrderItem, DraftOrder, FulfillmentType, PaymentStatus } from '../types';
import { getRelativeDateStr, generateId } from '../utils/formatters';

export function cleanMessengerThread(rawText: string): {
  mergedText: string;
  extractedSenderName: string;
} {
  const lines = rawText.split(/\r?\n/);
  let extractedSenderName = '';
  const cleanedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Skip standalone Messenger/IG timestamps
    if (/^(?:today|yesterday|mon|tue|wed|thu|fri|sat|sun)?\s*\d{1,2}:\d{2}\s*(?:am|pm)?$/i.test(line)) {
      continue;
    }

    // Skip seller's own outgoing lines ("You sent: ...")
    if (/^you\s+sent\s*:?/i.test(line)) {
      continue;
    }

    // Capture "[Name] sent:" header from copied Messenger threads
    const sentHeaderMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s+sent\s*:?\s*(.*)$/i);
    if (sentHeaderMatch) {
      const candidate = sentHeaderMatch[1].trim();
      if (!/^you$/i.test(candidate)) {
        extractedSenderName = candidate;
      }
      if (sentHeaderMatch[2] && sentHeaderMatch[2].trim()) {
        cleanedLines.push(sentHeaderMatch[2].trim());
      }
      continue;
    }

    cleanedLines.push(line);
  }

  return {
    mergedText: cleanedLines.join(' \n '),
    extractedSenderName
  };
}

export function parseChatToDraft(rawText: string, menuItems: MenuItem[]): DraftOrder | null {
  const today = getRelativeDateStr(0);
  const tomorrow = getRelativeDateStr(1);

  if (!rawText || !rawText.trim()) return null;

  const { mergedText, extractedSenderName } = cleanMessengerThread(rawText);
  const text = mergedText.trim();
  const lower = text.toLowerCase();

  // 1. EXTRACT CUSTOMER NAME
  let customerName = extractedSenderName || '';
  if (!customerName) {
    const namePatterns = [
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*:/,
      /(?:order\s+for|name\s*:|customer\s*:)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
      /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:here|po)\b/,
      /-\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$/,
      /(?:hi|hello|ate|boss|good\s*(?:am|pm|morning|afternoon))[!.,\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/,
      /^([A-Z][a-z]+\s+[A-Z][a-z]+)\s*-/
    ];

    for (const regex of namePatterns) {
      const match = text.match(regex);
      if (match && match[1]) {
        const candidate = match[1].trim();
        if (!/^(gcash|maya|maxim|lalamove|grab|today|tomorrow|bukas|pickup|delivery|order|pahabol)$/i.test(candidate)) {
          customerName = candidate;
          break;
        }
      }
    }
  }

  // Detect "pahabol" / add-on intent
  const isAppendIntent = /\b(pahabol|add\s*on|addon|dagdag|sa\s+order\s+ko)\b/i.test(lower);

  // 2. EXTRACT DUE DATE (Today vs Tomorrow)
  let dueDate = today;
  if (/\b(tomorrow|bukas|tom)\b/i.test(lower)) {
    dueDate = tomorrow;
  } else if (/\b(today|ngayon|mamaya|kanina)\b/i.test(lower)) {
    dueDate = today;
  }

  // 3. EXTRACT DUE TIME
  let dueTime = '';
  const timeMatch = lower.match(/\b(1[0-2]|0?[1-9])(?::([0-5][0-9]))?\s*(am|pm)\b/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] || '00';
    const meridian = timeMatch[3];
    if (meridian === 'pm' && hour < 12) hour += 12;
    if (meridian === 'am' && hour === 12) hour = 0;
    dueTime = `${String(hour).padStart(2, '0')}:${minute}`;
  }

  // 4. EXTRACT FULFILLMENT & DELIVERY ADDRESS
  let fulfillmentType: FulfillmentType = 'pickup';
  let deliveryAddress = '';

  if (/\b(deliver|delivery|lalamove|maxim|grab|rider)\b/i.test(lower)) {
    fulfillmentType = 'delivery';
    const addrMatch = text.match(
      /(?:@|\b(?:to|at|sa|address\s*:))\s*([A-Za-z0-9\s.,#-]{3,48}?)(?=\s+(?:today|tomorrow|bukas|paid|gcash|maya|cod|\d{1,2}(?::\d{2})?\s*(?:am|pm))|[.,!\n]|$)/i
    );
    if (addrMatch && addrMatch[1]) {
      const candidateAddr = addrMatch[1].trim();
      if (!/^order\s+ko/i.test(candidateAddr)) {
        deliveryAddress = candidateAddr;
      }
    }
  } else if (/\b(meetup|meet-up|meet up)\b/i.test(lower)) {
    fulfillmentType = 'meetup';
    const meetMatch = text.match(
      /\b(?:meetup|meet-up|meet up)\s+(?:at|sa|@)?\s*([A-Za-z0-9\s.-]{3,38}?)(?=\s+(?:today|tomorrow|bukas|cod|gcash|\d{1,2}(?::\d{2})?\s*(?:am|pm))|[.,!\n]|$)/i
    );
    if (meetMatch && meetMatch[1]) {
      deliveryAddress = meetMatch[1].trim();
    }
  }

  // 5. EXTRACT PAYMENT METHOD & STATUS (WITH DP AMOUNT EXTRACTION)
  let paymentMethod = 'GCash';
  if (/\b(gcash)\b/i.test(lower)) paymentMethod = 'GCash';
  else if (/\b(maya|paymaya)\b/i.test(lower)) paymentMethod = 'Maya';
  else if (/\b(cod|cash on delivery)\b/i.test(lower)) paymentMethod = 'COD';
  else if (/\b(cash)\b/i.test(lower)) paymentMethod = 'Cash';
  else if (/\b(bpi|bdo|bank|gotyme)\b/i.test(lower)) paymentMethod = 'Bank';

  let paymentStatus: PaymentStatus = 'unpaid';
  let explicitPaidAmount: number | null = null;

  if (/\b(dp|downpayment|down payment|partial|half)\b/i.test(lower)) {
    paymentStatus = 'partial';
    // Match both "dp 500" and "500 dp" patterns
    const dpBefore = lower.match(/\b(\d{2,5})\s*(?:php|pesos?)?\s*(?:dp|downpayment|down payment)\b/);
    const dpAfter = lower.match(/\b(?:dp|downpayment|down payment)\s*(?:sent|via|paid)?\s*(?:maya|gcash|cash)?\s*(\d{2,5})\b/);
    if (dpBefore) explicitPaidAmount = parseFloat(dpBefore[1]);
    else if (dpAfter) explicitPaidAmount = parseFloat(dpAfter[1]);
  } else if (/\b(paid na|already paid|sent na|bayad na|fully paid|paid via|paid)\b/i.test(lower) && !/\bunpaid\b/i.test(lower)) {
    paymentStatus = 'paid';
  } else if (/\b(later|mamaya|cod|unpaid|upon)\b/i.test(lower)) {
    paymentStatus = 'unpaid';
  }

  // 6. EXTRACT LINE ITEMS & QUANTITIES AGAINST MENU CATALOG
  const matchedItems: OrderItem[] = [];
  const sortedMenu = [...menuItems].sort((a, b) => {
    const maxA = Math.max(...a.keywords.map((k) => k.length));
    const maxB = Math.max(...b.keywords.map((k) => k.length));
    return maxB - maxA;
  });

  sortedMenu.forEach((menuItem) => {
    for (const kw of menuItem.keywords) {
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const itemRegex = new RegExp(
        `(?:\\b(\\d+)\\s*(?:x|boxes?|box|tubs?|tub|jars?|jar|pcs?|packs?|orders?|whole)?\\s+(?:of\\s+)?${escapedKw}\\b|\\b${escapedKw}\\s*(?:x|\\*)\\s*(\\d+)\\b)`,
        'i'
      );
      const match = lower.match(itemRegex);
      if (match) {
        const qty = parseInt(match[1] || match[2] || '1', 10);
        let itemNote = '';
        const parenMatch = text.match(new RegExp(`${escapedKw}[^().,\\n]*\\(([^)]+)\\)`, 'i'));
        if (parenMatch) {
          itemNote = parenMatch[1].trim();
        } else {
          const modMatch = lower.match(
            new RegExp(`${escapedKw}[^.,\\n]*\\b(less sweet|no nuts|extra cheese|warm|birthday topper)\\b`, 'i')
          );
          if (modMatch) itemNote = modMatch[1];
        }

        if (!matchedItems.some((m) => m.menu_item_id === menuItem.id)) {
          matchedItems.push({
            id: generateId(),
            menu_item_id: menuItem.id,
            item_name: menuItem.name,
            variant: menuItem.variant,
            quantity: qty,
            unit_price: menuItem.unit_price,
            notes: itemNote
          });
        }
        break;
      }
    }
  });

  const totalAmount = matchedItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  let amountPaid = 0;
  if (paymentStatus === 'paid') {
    amountPaid = totalAmount;
  } else if (paymentStatus === 'partial') {
    amountPaid = explicitPaidAmount !== null ? explicitPaidAmount : Math.round(totalAmount / 2);
  }

  return {
    customer_name: customerName,
    fulfillment_type: fulfillmentType,
    delivery_address: deliveryAddress,
    due_date: dueDate,
    due_time: dueTime,
    payment_status: paymentStatus,
    payment_method: paymentMethod,
    amount_paid: amountPaid,
    total_amount: totalAmount,
    raw_chat_snippet: rawText.trim(),
    is_append_intent: isAppendIntent,
    items: matchedItems
  };
}
