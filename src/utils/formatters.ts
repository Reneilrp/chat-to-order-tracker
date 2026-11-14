export const SELLER_PAYMENT_INFO = 'GCash / Maya: 0917-842-1904 (BakeFlow Kitchen)';

export const getRelativeDateStr = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatCurrency = (amount: number | string): string => {
  const num = Number(amount) || 0;
  return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatDisplayTime = (time24?: string): string => {
  if (!time24) return 'Anytime';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr || '00'} ${ampm}`;
};

export const generateId = (): string => Math.random().toString(36).substring(2, 9);

export const copyToClipboardSafe = (
  text: string,
  onSuccess?: () => void
): void => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => {});
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    if (onSuccess) onSuccess();
  }
};
