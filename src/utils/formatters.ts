/**
 * Utility functions for currency, weight, and price calculations
 */

export function formatCurrency(value: number): string {
  if (isNaN(value) || value === null || value === undefined) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseCurrencyInput(text: string): number {
  if (!text) return 0;
  // Replace comma with dot, remove non-numeric chars except dot
  const clean = text.replace(/[^\d,\.]/g, '').replace(',', '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatWeight(weight?: number, unit: 'kg' | 'g' = 'kg'): string {
  if (weight === undefined || weight === null || weight <= 0) return '';
  if (unit === 'g') {
    return `${Math.round(weight)} g`;
  }
  // For kg, format with up to 3 decimals e.g. 1,250 kg or 0,75 kg
  const formatted = weight.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
  return `${formatted} kg`;
}

export function calculateItemTotal(item: {
  price: number;
  quantity?: number;
  weight?: number;
  weightUnit?: 'kg' | 'g';
}): number {
  const price = item.price || 0;

  // If item has weight (e.g. meat/fruits priced per kg)
  if (item.weight && item.weight > 0) {
    const weightInKg = item.weightUnit === 'g' ? item.weight / 1000 : item.weight;
    // Price represents price per kg
    return weightInKg * price;
  }

  // Otherwise by quantity
  const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
  return price * quantity;
}
