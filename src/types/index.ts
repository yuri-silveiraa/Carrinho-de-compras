export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  loginMethod: 'google' | 'demo';
  createdAt: string;
}

export type CategoryId =
  | 'hortifruti'
  | 'carnes'
  | 'laticinios'
  | 'mercearia'
  | 'bebidas'
  | 'padaria'
  | 'limpeza'
  | 'higiene'
  | 'congelados'
  | 'outros';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string; // Expo vector icon name
  color: string;
  bgColor: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: CategoryId | string;
  price: number; // Unit price or total price
  isPaid: boolean; // "se ja esta pago ou não"
  weight?: number; // Optional weight (e.g. 1.25 kg)
  weightUnit?: 'kg' | 'g';
  quantity?: number; // Optional quantity (e.g. 2, default 1)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  updatedAt: string;
  items: ShoppingItem[];
}

export interface BackupPayload {
  version: string;
  exportedAt: string;
  user: {
    name: string;
    email: string;
  };
  listsCount: number;
  itemsCount: number;
  totalValue: number;
  lists: ShoppingList[];
}

export type RootStackParamList = {
  Home: undefined;
  ListDetail: { listId: string; listName: string };
};
