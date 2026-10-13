import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShoppingItem, CategoryId } from '../types';
import { CATEGORIES, getCategoryById } from '../constants/categories';
import { theme } from '../constants/theme';
import { formatCurrency, parseCurrencyInput, calculateItemTotal } from '../utils/formatters';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialItem?: ShoppingItem | null;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialItem,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId>('mercearia');
  const [priceText, setPriceText] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [measureMode, setMeasureMode] = useState<'unit' | 'weight'>('unit');
  const [quantity, setQuantity] = useState(1);
  const [weightText, setWeightText] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'g'>('kg');

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setCategory((initialItem.category as CategoryId) || 'outros');
      setPriceText(initialItem.price ? initialItem.price.toString().replace('.', ',') : '');
      setIsPaid(initialItem.isPaid);

      if (initialItem.weight && initialItem.weight > 0) {
        setMeasureMode('weight');
        setWeightText(initialItem.weight.toString().replace('.', ','));
        setWeightUnit(initialItem.weightUnit || 'kg');
        setQuantity(1);
      } else {
        setMeasureMode('unit');
        setQuantity(initialItem.quantity || 1);
        setWeightText('');
        setWeightUnit('kg');
      }
    } else {
      // Reset defaults
      setName('');
      setCategory('mercearia');
      setPriceText('');
      setIsPaid(false);
      setMeasureMode('unit');
      setQuantity(1);
      setWeightText('');
      setWeightUnit('kg');
    }
  }, [initialItem, visible]);

  // Suggest weight mode automatically if meat or hortifruti category is selected
  const handleSelectCategory = (catId: CategoryId) => {
    setCategory(catId);
    if (!initialItem && (catId === 'carnes' || catId === 'hortifruti')) {
      setMeasureMode('weight');
    }
  };

  const currentPrice = parseCurrencyInput(priceText);
  const currentWeight = parseCurrencyInput(weightText);

  const calculatedTotal = calculateItemTotal({
    price: currentPrice,
    quantity: measureMode === 'unit' ? quantity : undefined,
    weight: measureMode === 'weight' ? currentWeight : undefined,
    weightUnit: measureMode === 'weight' ? weightUnit : undefined,
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o nome do item.');
      return;
    }

    const itemData: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      category,
      price: currentPrice,
      isPaid,
      quantity: measureMode === 'unit' ? Math.max(1, quantity) : 1,
      weight: measureMode === 'weight' && currentWeight > 0 ? currentWeight : undefined,
      weightUnit: measureMode === 'weight' && currentWeight > 0 ? weightUnit : undefined,
    };

    onSubmit(itemData);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  {initialItem ? 'Editar Item' : 'Novo Item na Lista'}
                </Text>
                <Text style={styles.subtitle}>
                  Preencha os detalhes do produto que vai comprar
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={28} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Nome */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Nome do Item <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Arroz, Picanha, Maçã..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Categorias */}
              <View style={styles.field}>
                <Text style={styles.label}>Categoria</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryScroll}
                >
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => handleSelectCategory(cat.id)}
                        style={[
                          styles.categoryChip,
                          {
                            borderColor: isSelected ? cat.color : theme.colors.border,
                            backgroundColor: isSelected ? cat.bgColor : theme.colors.card,
                          },
                        ]}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={16}
                          color={isSelected ? cat.color : theme.colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.categoryText,
                            {
                              color: isSelected ? cat.color : theme.colors.textSecondary,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Tipo de Medida: Unidade vs Peso */}
              <View style={styles.field}>
                <Text style={styles.label}>Tipo de Medida</Text>
                <View style={styles.measureToggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.measureTab,
                      measureMode === 'unit' && styles.measureTabActive,
                    ]}
                    onPress={() => setMeasureMode('unit')}
                  >
                    <Ionicons
                      name="layers-outline"
                      size={16}
                      color={measureMode === 'unit' ? '#FFFFFF' : theme.colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.measureTabText,
                        measureMode === 'unit' && styles.measureTabTextActive,
                      ]}
                    >
                      Por Unidade
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.measureTab,
                      measureMode === 'weight' && styles.measureTabActive,
                    ]}
                    onPress={() => setMeasureMode('weight')}
                  >
                    <Ionicons
                      name="scale-outline"
                      size={16}
                      color={measureMode === 'weight' ? '#FFFFFF' : theme.colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.measureTabText,
                        measureMode === 'weight' && styles.measureTabTextActive,
                      ]}
                    >
                      Por Peso (Carne/Fruta)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quantidade ou Peso */}
              {measureMode === 'unit' ? (
                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1, marginRight: theme.spacing.sm }]}>
                    <Text style={styles.label}>Preço Unitário (R$)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0,00"
                      placeholderTextColor={theme.colors.textMuted}
                      value={priceText}
                      onChangeText={setPriceText}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.field, { flex: 1, marginLeft: theme.spacing.sm }]}>
                    <Text style={styles.label}>Quantidade</Text>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                      >
                        <Ionicons name="remove" size={18} color={theme.colors.text} />
                      </TouchableOpacity>
                      <Text style={styles.stepperValue}>{quantity}</Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setQuantity((q) => q + 1)}
                      >
                        <Ionicons name="add" size={18} color={theme.colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1, marginRight: theme.spacing.sm }]}>
                    <Text style={styles.label}>Preço por kg (R$)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 39,90"
                      placeholderTextColor={theme.colors.textMuted}
                      value={priceText}
                      onChangeText={setPriceText}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.field, { flex: 1, marginLeft: theme.spacing.sm }]}>
                    <Text style={styles.label}>Peso</Text>
                    <View style={styles.weightInputContainer}>
                      <TextInput
                        style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                        placeholder="Ex: 1,250"
                        placeholderTextColor={theme.colors.textMuted}
                        value={weightText}
                        onChangeText={setWeightText}
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={styles.weightUnitBtn}
                        onPress={() => setWeightUnit((u) => (u === 'kg' ? 'g' : 'kg'))}
                      >
                        <Text style={styles.weightUnitText}>{weightUnit}</Text>
                        <Ionicons name="swap-vertical" size={12} color={theme.colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Status de Pagamento ("se ja esta pago ou não") */}
              <View style={styles.paidStatusCard}>
                <View style={styles.paidStatusInfo}>
                  <Ionicons
                    name={isPaid ? 'checkmark-circle' : 'hourglass-outline'}
                    size={22}
                    color={isPaid ? theme.colors.success : theme.colors.accent}
                  />
                  <View style={{ marginLeft: theme.spacing.md }}>
                    <Text style={styles.paidStatusTitle}>
                      {isPaid ? 'Já está pago / no carrinho' : 'Pendente (ainda não paguei)'}
                    </Text>
                    <Text style={styles.paidStatusSub}>
                      {isPaid
                        ? 'Item marcado como comprado'
                        : 'Será somado como valor a pagar'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isPaid}
                  onValueChange={setIsPaid}
                  trackColor={{ false: '#CBD5E1', true: theme.colors.primaryLight }}
                  thumbColor={isPaid ? theme.colors.primary : '#F1F5F9'}
                />
              </View>

              {/* Subtotal Preview */}
              <View style={styles.totalPreviewCard}>
                <Text style={styles.totalPreviewLabel}>Total do Item:</Text>
                <Text style={styles.totalPreviewValue}>{formatCurrency(calculatedTotal)}</Text>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
                <Ionicons
                  name={initialItem ? 'save-outline' : 'checkmark-sharp'}
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.submitBtnText}>
                  {initialItem ? 'Salvar Item' : 'Adicionar Item'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  container: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
    paddingTop: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 2,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  field: {
    marginBottom: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  required: {
    color: theme.colors.danger,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.text,
  },
  categoryScroll: {
    paddingVertical: 4,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    gap: 6,
  },
  categoryText: {
    fontSize: 13,
  },
  measureToggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  measureTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  measureTabActive: {
    backgroundColor: theme.colors.primary,
  },
  measureTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  measureTabTextActive: {
    color: '#FFFFFF',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    height: 48,
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightUnitBtn: {
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderTopRightRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    height: 47,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  weightUnitText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  paidStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  paidStatusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paidStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paidStatusSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  totalPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
    marginBottom: theme.spacing.md,
  },
  totalPreviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  totalPreviewValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    gap: theme.spacing.md,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
