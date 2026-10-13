import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  SafeAreaView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ShoppingItem } from '../types';
import { useLists } from '../contexts/ListContext';
import { ShoppingItemCard } from '../components/ShoppingItemCard';
import { AddItemModal } from '../components/AddItemModal';
import { theme } from '../constants/theme';
import { formatCurrency, calculateItemTotal } from '../utils/formatters';
import { formatDateDisplay } from '../utils/date';
import { getCategoryById } from '../constants/categories';

type ListDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ListDetail'>;

type FilterStatus = 'all' | 'pending' | 'paid';

export const ListDetailScreen: React.FC<ListDetailScreenProps> = ({ route, navigation }) => {
  const { listId } = route.params;
  const { getListById, addItem, updateItem, toggleItemPaid, deleteItem, updateListName } = useLists();

  const list = getListById(listId);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(list?.name || '');

  // Totals calculations
  const { totalValue, paidValue, pendingValue, totalCount, paidCount, progressPercent } =
    useMemo(() => {
      if (!list) {
        return {
          totalValue: 0,
          paidValue: 0,
          pendingValue: 0,
          totalCount: 0,
          paidCount: 0,
          progressPercent: 0,
        };
      }

      let total = 0;
      let paid = 0;
      let pCount = 0;

      list.items.forEach((item) => {
        const itemTotal = calculateItemTotal(item);
        total += itemTotal;
        if (item.isPaid) {
          paid += itemTotal;
          pCount++;
        }
      });

      const count = list.items.length;
      const progress = count > 0 ? (pCount / count) * 100 : 0;

      return {
        totalValue: total,
        paidValue: paid,
        pendingValue: total - paid,
        totalCount: count,
        paidCount: pCount,
        progressPercent: progress,
      };
    }, [list]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!list) return [];
    return list.items.filter((item) => {
      // Status filter
      if (filterStatus === 'pending' && item.isPaid) return false;
      if (filterStatus === 'paid' && !item.isPaid) return false;

      // Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        return matchesName || matchesCategory;
      }

      return true;
    });
  }, [list, filterStatus, searchQuery]);

  if (!list) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.danger} />
          <Text style={styles.notFoundText}>Lista não encontrada.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Voltar para o Início</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveItem = (itemData: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      updateItem(list.id, editingItem.id, itemData);
      setEditingItem(null);
    } else {
      addItem(list.id, itemData);
    }
  };

  const handleConfirmDeleteItem = (item: ShoppingItem) => {
    Alert.alert(
      'Remover Item',
      `Deseja remover "${item.name}" desta lista de compras?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => deleteItem(list.id, item.id),
        },
      ]
    );
  };

  const handleShareList = async () => {
    let message = `🛒 Lista de Compras: ${list.name}\n`;
    message += `📅 Data: ${formatDateDisplay(list.createdAt)}\n\n`;

    list.items.forEach((i, idx) => {
      const cat = getCategoryById(i.category);
      const val = calculateItemTotal(i);
      const status = i.isPaid ? '✅' : '⬜';
      message += `${status} ${i.name} (${cat.name}) - ${formatCurrency(val)}\n`;
    });

    message += `\nTotal: ${formatCurrency(totalValue)} (Já pago: ${formatCurrency(paidValue)})`;

    try {
      await Share.share({ message });
    } catch (err: any) {
      Alert.alert('Erro ao compartilhar', err?.message);
    }
  };

  const handleSaveListName = () => {
    if (editedName.trim()) {
      updateListName(list.id, editedName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.titleArea}>
          {isEditingName ? (
            <View style={styles.editNameRow}>
              <TextInput
                style={styles.editNameInput}
                value={editedName}
                onChangeText={setEditedName}
                autoFocus
                onSubmitEditing={handleSaveListName}
              />
              <TouchableOpacity onPress={handleSaveListName} style={styles.saveNameBtn}>
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setEditedName(list.name);
                setIsEditingName(true);
              }}
              style={styles.nameTouch}
            >
              <Text style={styles.listTitle} numberOfLines={1}>
                {list.name}
              </Text>
              <Ionicons name="pencil" size={14} color={theme.colors.textMuted} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
          <Text style={styles.listSubtitle}>Criada em {formatDateDisplay(list.createdAt)}</Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleShareList}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="share-social-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Summary Financial Banner */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryStatsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>Total Planejado</Text>
            <Text style={styles.statBoxValueTotal}>{formatCurrency(totalValue)}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>Já Pago</Text>
            <Text style={styles.statBoxValuePaid}>{formatCurrency(paidValue)}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>A Pagar</Text>
            <Text style={styles.statBoxValuePending}>{formatCurrency(pendingValue)}</Text>
          </View>
        </View>

        {/* Mini progress bar */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressPercentText}>
            {paidCount} de {totalCount} itens pagos ({Math.round(progressPercent)}%)
          </Text>
        </View>
      </View>

      {/* Filter and Search Bar */}
      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou categoria..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter Chips */}
        <View style={styles.statusFilters}>
          <TouchableOpacity
            style={[styles.statusChip, filterStatus === 'all' && styles.statusChipActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.statusChipText, filterStatus === 'all' && styles.statusChipTextActive]}>
              Todos ({list.items.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusChip, filterStatus === 'pending' && styles.statusChipActive]}
            onPress={() => setFilterStatus('pending')}
          >
            <Text style={[styles.statusChipText, filterStatus === 'pending' && styles.statusChipTextActive]}>
              Pendentes ({totalCount - paidCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusChip, filterStatus === 'paid' && styles.statusChipActive]}
            onPress={() => setFilterStatus('paid')}
          >
            <Text style={[styles.statusChipText, filterStatus === 'paid' && styles.statusChipTextActive]}>
              Pagos ({paidCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ShoppingItemCard
            item={item}
            onTogglePaid={() => toggleItemPaid(list.id, item.id)}
            onEdit={() => {
              setEditingItem(item);
              setAddModalVisible(true);
            }}
            onDelete={() => handleConfirmDeleteItem(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name={searchQuery ? 'search' : 'cart-outline'}
                size={40}
                color={theme.colors.textMuted}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Nenhum item encontrado' : 'Nenhum item na lista'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Tente buscar com outro termo ou limpe o campo de busca.'
                : 'Toque no botão abaixo para adicionar seu primeiro produto com nome, categoria, preço, peso ou quantidade.'}
            </Text>
          </View>
        }
      />

      {/* Bottom Floating Add Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addItemBtn}
          onPress={() => {
            setEditingItem(null);
            setAddModalVisible(true);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addItemBtnText}>Adicionar Item</Text>
        </TouchableOpacity>
      </View>

      {/* Add / Edit Item Modal */}
      <AddItemModal
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
          setEditingItem(null);
        }}
        onSubmit={handleSaveItem}
        initialItem={editingItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  nameTouch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  listSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    borderBottomWidth: 1.5,
    borderBottomColor: theme.colors.primary,
    paddingVertical: 2,
  },
  saveNameBtn: {
    padding: 4,
    marginLeft: 6,
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.divider,
  },
  statBoxLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statBoxValueTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
  },
  statBoxValuePaid: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  statBoxValuePending: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  progressBarWrapper: {
    gap: 4,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.borderLight,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressPercentText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  filterSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 40,
    marginBottom: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  statusChipTextActive: {
    color: theme.colors.primaryDark,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    ...theme.shadows.md,
  },
  addItemBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
