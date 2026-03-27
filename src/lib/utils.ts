import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export function getComplianceColor(current: number, target: number) {
  const ratio = current / target;
  if (ratio >= 0.85 && ratio <= 1.15) return 'bg-notion-green';
  if (ratio >= 0.4) return 'bg-notion-yellow';
  return 'bg-notion-red/30';
}
