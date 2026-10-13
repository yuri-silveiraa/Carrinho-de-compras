import { Category, CategoryId } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'hortifruti',
    name: 'Hortifrúti',
    icon: 'nutrition-outline',
    color: '#16A34A',
    bgColor: '#DCFCE7',
  },
  {
    id: 'carnes',
    name: 'Carnes & Peixes',
    icon: 'restaurant-outline',
    color: '#DC2626',
    bgColor: '#FEE2E2',
  },
  {
    id: 'laticinios',
    name: 'Laticínios',
    icon: 'egg-outline',
    color: '#D97706',
    bgColor: '#FEF3C7',
  },
  {
    id: 'mercearia',
    name: 'Mercearia',
    icon: 'basket-outline',
    color: '#854D0E',
    bgColor: '#FEF9C3',
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    icon: 'wine-outline',
    color: '#0284C7',
    bgColor: '#E0F2FE',
  },
  {
    id: 'padaria',
    name: 'Padaria',
    icon: 'pizza-outline',
    color: '#EA580C',
    bgColor: '#FFEDD5',
  },
  {
    id: 'limpeza',
    name: 'Limpeza',
    icon: 'sparkles-outline',
    color: '#0D9488',
    bgColor: '#CCFBF1',
  },
  {
    id: 'higiene',
    name: 'Higiene',
    icon: 'medkit-outline',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
  },
  {
    id: 'congelados',
    name: 'Congelados',
    icon: 'snow-outline',
    color: '#2563EB',
    bgColor: '#DBEAFE',
  },
  {
    id: 'outros',
    name: 'Outros',
    icon: 'cube-outline',
    color: '#64748B',
    bgColor: '#F1F5F9',
  },
];

export function getCategoryById(id: CategoryId | string): Category {
  const found = CATEGORIES.find((cat) => cat.id === id || cat.name.toLowerCase() === id.toLowerCase());
  if (found) return found;
  return {
    id: 'outros',
    name: id || 'Outros',
    icon: 'cube-outline',
    color: '#64748B',
    bgColor: '#F1F5F9',
  };
}
