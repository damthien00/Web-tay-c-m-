export function formatVND(amount: number): string {
  // Format Vietnamese Dong with k for thousands and tr for millions
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    if (millions % 1 === 0) {
      return `${millions.toLocaleString('vi-VN')}tr ₫`;
    }
    return `${millions.toLocaleString('vi-VN')}tr ₫`;
  } else if (amount >= 1000) {
    const thousands = amount / 1000;
    if (thousands % 1 === 0) {
      return `${thousands.toLocaleString('vi-VN')}k ₫`;
    }
    return `${thousands.toLocaleString('vi-VN')}k ₫`;
  }
  
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

export function parseVND(input: string): number {
  if (!input || typeof input !== 'string') return 0;
  
  // Convert to lowercase and trim
  const cleaned = input.toLowerCase().trim();
  
  // Handle abbreviated formats
  if (cleaned.includes('k')) {
    const number = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return Math.round((number || 0) * 1000);
  }
  
  if (cleaned.includes('tr') || cleaned.includes('m')) {
    const number = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return Math.round((number || 0) * 1000000);
  }
  
  if (cleaned.includes('b')) {
    const number = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return Math.round((number || 0) * 1000000000);
  }
  
  // Handle regular numbers (remove all non-digit characters except decimal points)
  const numberOnly = cleaned.replace(/[^\d.]/g, '');
  return Math.round(parseFloat(numberOnly) || 0);
}

export function formatInputPreview(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  const amount = parseVND(input);
  if (amount === 0) return '';
  
  return formatVND(amount);
}

export function formatCurrency(amount: number, compact: boolean = false): string {
  return formatVND(amount);
}