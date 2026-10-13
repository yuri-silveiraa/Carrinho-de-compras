import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingList, ShoppingItem, UserProfile, BackupPayload } from '../types';
import { getDefaultListName } from '../utils/date';

const STORAGE_KEYS = {
  USER: '@carrinho:user',
  LISTS: '@carrinho:lists',
};

// ================= USER STORAGE =================

export async function getStoredUser(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading stored user:', error);
    return null;
  }
}

export async function storeUser(user: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user:', error);
    throw error;
  }
}

export async function removeStoredUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error removing user:', error);
  }
}

// ================= LISTS STORAGE =================

/**
 * Sorts lists from newest to oldest based on creation timestamp
 */
function sortNewestFirst(lists: ShoppingList[]): ShoppingList[] {
  return [...lists].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeB - timeA;
  });
}

export async function getStoredLists(): Promise<ShoppingList[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LISTS);
    if (!raw) return [];
    const parsed: ShoppingList[] = JSON.parse(raw);
    return sortNewestFirst(parsed);
  } catch (error) {
    console.error('Error reading stored lists:', error);
    return [];
  }
}

export async function storeLists(lists: ShoppingList[]): Promise<void> {
  try {
    const sorted = sortNewestFirst(lists);
    await AsyncStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(sorted));
  } catch (error) {
    console.error('Error saving lists:', error);
    throw error;
  }
}

/**
 * Creates a new shopping list.
 * If name is empty, automatically generates "[nome do mês / AA]" (e.g. "Outubro / 26")
 */
export async function createNewList(customName?: string): Promise<ShoppingList> {
  const currentLists = await getStoredLists();
  const trimmed = customName?.trim();
  const finalName = trimmed && trimmed.length > 0 ? trimmed : getDefaultListName();

  const now = new Date().toISOString();
  const newList: ShoppingList = {
    id: `list_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: finalName,
    createdAt: now,
    updatedAt: now,
    items: [],
  };

  const updated = [newList, ...currentLists];
  await storeLists(updated);
  return newList;
}

export async function deleteStoredList(listId: string): Promise<ShoppingList[]> {
  const currentLists = await getStoredLists();
  const updated = currentLists.filter((l) => l.id !== listId);
  await storeLists(updated);
  return updated;
}

export async function updateStoredListName(listId: string, newName: string): Promise<ShoppingList[]> {
  const currentLists = await getStoredLists();
  const now = new Date().toISOString();
  const updated = currentLists.map((l) => {
    if (l.id === listId) {
      return { ...l, name: newName.trim(), updatedAt: now };
    }
    return l;
  });
  await storeLists(updated);
  return updated;
}

// ================= ITEMS OPERATIONS =================

export async function addItemToList(
  listId: string,
  itemData: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ShoppingList[]> {
  const currentLists = await getStoredLists();
  const now = new Date().toISOString();
  const newItem: ShoppingItem = {
    ...itemData,
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };

  const updated = currentLists.map((list) => {
    if (list.id === listId) {
      return {
        ...list,
        updatedAt: now,
        items: [newItem, ...list.items],
      };
    }
    return list;
  });

  await storeLists(updated);
  return updated;
}

export async function updateItemInList(
  listId: string,
  itemId: string,
  updates: Partial<ShoppingItem>
): Promise<ShoppingList[]> {
  const currentLists = await getStoredLists();
  const now = new Date().toISOString();

  const updated = currentLists.map((list) => {
    if (list.id === listId) {
      return {
        ...list,
        updatedAt: now,
        items: list.items.map((item) =>
          item.id === itemId ? { ...item, ...updates, updatedAt: now } : item
        ),
      };
    }
    return list;
  });

  await storeLists(updated);
  return updated;
}

export async function toggleItemPaidStatus(listId: string, itemId: string): Promise<ShoppingList[]> {
  const currentLists = await getStoredLists();
  const now = new Date().toISOString();

  const updated = currentLists.map((list) => {
    if (list.id === listId) {
      return {
        ...list,
        updatedAt: now,
        items: list.items.map((item) =>
          item.id === itemId ? { ...item, isPaid: !item.isPaid, updatedAt: now } : item
        ),
      };
    }
    return list;
  });

  await storeLists(updated);
  return updated;
}

export async function deleteItemFromList(listId: string, itemId: string): Promise<ShoppingList[]> {
  const currentLists = await getStoredLists();
  const now = new Date().toISOString();

  const updated = currentLists.map((list) => {
    if (list.id === listId) {
      return {
        ...list,
        updatedAt: now,
        items: list.items.filter((item) => item.id !== itemId),
      };
    }
    return list;
  });

  await storeLists(updated);
  return updated;
}

// ================= IMPORT / RESTORE =================

export async function restoreBackup(payload: BackupPayload): Promise<ShoppingList[]> {
  if (!Array.isArray(payload.lists)) {
    throw new Error('Formato de backup inválido.');
  }

  const existing = await getStoredLists();
  // Merge lists by ID (or keep new ones)
  const existingIds = new Set(existing.map((l) => l.id));
  const merged = [...existing];

  for (const list of payload.lists) {
    if (!existingIds.has(list.id)) {
      merged.push(list);
    }
  }

  const sorted = sortNewestFirst(merged);
  await storeLists(sorted);
  return sorted;
}
