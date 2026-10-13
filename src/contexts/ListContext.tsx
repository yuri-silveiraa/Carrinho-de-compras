import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ShoppingList, ShoppingItem, BackupPayload } from '../types';
import * as storage from '../services/storage';

interface ListContextData {
  lists: ShoppingList[];
  isLoading: boolean;
  createList: (name?: string) => Promise<ShoppingList>;
  deleteList: (listId: string) => Promise<void>;
  updateListName: (listId: string, newName: string) => Promise<void>;
  addItem: (listId: string, itemData: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (listId: string, itemId: string, updates: Partial<ShoppingItem>) => Promise<void>;
  toggleItemPaid: (listId: string, itemId: string) => Promise<void>;
  deleteItem: (listId: string, itemId: string) => Promise<void>;
  restoreFromBackup: (payload: BackupPayload) => Promise<void>;
  getListById: (listId: string) => ShoppingList | undefined;
  refreshLists: () => Promise<void>;
}

const ListContext = createContext<ListContextData>({} as ListContextData);

export const ListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshLists = useCallback(async () => {
    try {
      setIsLoading(true);
      const loaded = await storage.getStoredLists();
      setLists(loaded);
    } catch (err) {
      console.error('Failed to load lists:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLists();
  }, [refreshLists]);

  const createList = async (name?: string): Promise<ShoppingList> => {
    const newList = await storage.createNewList(name);
    await refreshLists();
    return newList;
  };

  const deleteList = async (listId: string): Promise<void> => {
    const updated = await storage.deleteStoredList(listId);
    setLists(updated);
  };

  const updateListName = async (listId: string, newName: string): Promise<void> => {
    const updated = await storage.updateStoredListName(listId, newName);
    setLists(updated);
  };

  const addItem = async (
    listId: string,
    itemData: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    const updated = await storage.addItemToList(listId, itemData);
    setLists(updated);
  };

  const updateItem = async (
    listId: string,
    itemId: string,
    updates: Partial<ShoppingItem>
  ): Promise<void> => {
    const updated = await storage.updateItemInList(listId, itemId, updates);
    setLists(updated);
  };

  const toggleItemPaid = async (listId: string, itemId: string): Promise<void> => {
    const updated = await storage.toggleItemPaidStatus(listId, itemId);
    setLists(updated);
  };

  const deleteItem = async (listId: string, itemId: string): Promise<void> => {
    const updated = await storage.deleteItemFromList(listId, itemId);
    setLists(updated);
  };

  const restoreFromBackup = async (payload: BackupPayload): Promise<void> => {
    const updated = await storage.restoreBackup(payload);
    setLists(updated);
  };

  const getListById = (listId: string): ShoppingList | undefined => {
    return lists.find((l) => l.id === listId);
  };

  return (
    <ListContext.Provider
      value={{
        lists,
        isLoading,
        createList,
        deleteList,
        updateListName,
        addItem,
        updateItem,
        toggleItemPaid,
        deleteItem,
        restoreFromBackup,
        getListById,
        refreshLists,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export function useLists(): ListContextData {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useLists must be used within a ListProvider');
  }
  return context;
}
