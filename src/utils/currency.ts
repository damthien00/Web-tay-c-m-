export function formatVND(amount: number): string {
	// Handle negative amounts
	const isNegative = amount < 0;
	const absoluteAmount = Math.abs(amount);

	let formatted: string;

	// Format Vietnamese Dong with k for thousands and tr for millions
	if (absoluteAmount >= 1000000) {
		const millions = absoluteAmount / 1000000;
		if (millions % 1 === 0) {
			formatted = `${millions.toLocaleString('vi-VN')}tr ₫`;
		} else {
			formatted = `${millions.toLocaleString('vi-VN')}tr ₫`;
		}
	} else if (absoluteAmount >= 1000) {
		const thousands = absoluteAmount / 1000;
		if (thousands % 1 === 0) {
			formatted = `${thousands.toLocaleString('vi-VN')}k ₫`;
		} else {
			formatted = `${thousands.toLocaleString('vi-VN')}k ₫`;
		}
	} else {
		formatted = `${absoluteAmount.toLocaleString('vi-VN')} ₫`;
	}

	return isNegative ? `-${formatted}` : formatted;
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


export const formatPrice = (price: number | null | undefined) => {
    if (price == null) return "0 ₫";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);
};