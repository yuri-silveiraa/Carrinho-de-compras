import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShoppingItem } from '../types';
import { getCategoryById } from '../constants/categories';
import { theme } from '../constants/theme';
import { formatCurrency, formatWeight, calculateItemTotal } from '../utils/formatters';

interface ShoppingItemCardProps {
  item: ShoppingItem;
  onTogglePaid: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ShoppingItemCard: React.FC<ShoppingItemCardProps> = ({
  item,
  onTogglePaid,
  onEdit,
  onDelete,
}) => {
  const category = getCategoryById(item.category);
  const total = calculateItemTotal(item);

  return (
    <View
      style={[
        styles.card,
        item.isPaid ? styles.cardPaid : styles.cardUnpaid,
      ]}
    >
      {/* Checkbox button */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          item.isPaid ? styles.checkboxChecked : styles.checkboxUnchecked,
        ]}
        onPress={onTogglePaid}
        activeOpacity={0.7}
      >
        {item.isPaid ? (
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        ) : (
          <View style={styles.checkboxInner} />
        )}
      </TouchableOpacity>

      {/* Item info */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.name,
              item.isPaid && styles.namePaid,
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: category.bgColor },
            ]}
          >
            <Ionicons
              name={category.icon as any}
              size={12}
              color={category.color}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.categoryText, { color: category.color }]}>
              {category.name}
            </Text>
          </View>
        </View>

        {/* Quantities & Pricing breakdown */}
        <View style={styles.detailRow}>
          {item.weight && item.weight > 0 ? (
            <Text style={styles.measureDetail}>
              {formatWeight(item.weight, item.weightUnit)} • {formatCurrency(item.price)}/kg
            </Text>
          ) : (item.quantity && item.quantity > 1) ? (
            <Text style={styles.measureDetail}>
              {item.quantity} unidades • {formatCurrency(item.price)} un
            </Text>
          ) : (
            <Text style={styles.measureDetail}>1 un</Text>
          )}

          <Text style={[styles.totalPrice, item.isPaid && styles.totalPricePaid]}>
            {formatCurrency(total)}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="pencil-outline" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  cardPaid: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: '#FAFDFB',
    opacity: 0.92,
  },
  cardUnpaid: {
    borderColor: theme.colors.border,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxUnchecked: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  namePaid: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  measureDetail: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalPricePaid: {
    color: theme.colors.primaryDark,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
    gap: 4,
  },
  iconBtn: {
    padding: 6,
  },
});
