/**
 * Helper utilities for dates and default list naming
 */

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/**
 * Returns the default shopping list name in format: "[nome do mês / AA]"
 * Example: "Outubro / 26"
 */
export function getDefaultListName(date: Date = new Date()): string {
  const monthName = MONTH_NAMES[date.getMonth()];
  const year2Digits = String(date.getFullYear()).slice(-2);
  return `${monthName} / ${year2Digits}`;
}

/**
 * Formats an ISO date into full Portuguese display: "13 de Outubro de 2026"
 */
export function formatDateDisplay(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  } catch {
    return '';
  }
}

/**
 * Formats date into "DD/MM/AAAA às HH:mm"
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return '';
  }
}
