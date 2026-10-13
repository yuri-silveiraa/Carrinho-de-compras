import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShoppingList } from '../types';
import { theme } from '../constants/theme';
import { formatDateDisplay } from '../utils/date';
import { formatCurrency, calculateItemTotal } from '../utils/formatters';

interface ShoppingListCardProps {
  list: ShoppingList;
  onPress: () => void;
  onDelete: () => void;
}

export const ShoppingListCard: React.FC<ShoppingListCardProps> = ({
  list,
  onPress,
  onDelete,
}) => {
  const totalItems = list.items.length;
  const paidItems = list.items.filter((i) => i.isPaid).length;

  let totalValue = 0;
  let paidValue = 0;

  list.items.forEach((item) => {
    const val = calculateItemTotal(item);
    totalValue += val;
    if (item.isPaid) paidValue += val;
  });

  const progressPercent = totalItems > 0 ? (paidItems / totalItems) * 100 : 0;
  const isCompleted = totalItems > 0 && paidItems === totalItems;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconWrap, isCompleted && styles.iconWrapCompleted]}>
            <Ionicons
              name={isCompleted ? 'checkmark-done-circle' : 'cart'}
              size={20}
              color={isCompleted ? '#FFFFFF' : theme.colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.listName} numberOfLines={1}>
              {list.name}
            </Text>
            <Text style={styles.listDate}>{formatDateDisplay(list.createdAt)}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Stats summary */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Itens</Text>
          <Text style={styles.statValue}>
            {totalItems === 0
              ? 'Lista vazia'
              : `${paidItems}/${totalItems} pagos`}
          </Text>
        </View>

        <View style={[styles.statItem, { alignItems: 'flex-end' }]}>
          <Text style={styles.statLabel}>Total Planejado</Text>
          <Text style={styles.statValueTotal}>{formatCurrency(totalValue)}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
                isCompleted && styles.progressBarFillCompleted,
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progressPercent)}% concluído
          </Text>
        </View>
      )}

      {/* Footer chevron */}
      <View style={styles.cardFooter}>
        <Text style={styles.viewItemsText}>Toque para abrir a lista</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  iconWrapCompleted: {
    backgroundColor: theme.colors.primary,
  },
  listName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  listDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statItem: {
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statValueTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
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
  progressBarFillCompleted: {
    backgroundColor: theme.colors.success,
  },
  progressText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  viewItemsText: {
    fontSize: 12,
    color: theme.colors.primaryDark,
    fontWeight: '600',
    marginRight: 4,
  },
});
