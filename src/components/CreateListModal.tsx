import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { getDefaultListName } from '../utils/date';

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name?: string) => void;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const defaultName = getDefaultListName();

  const handleCreate = () => {
    onSubmit(name.trim() || undefined);
    setName('');
    onClose();
  };

  const handleCancel = () => {
    setName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <View style={styles.modalCard}>
              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <Ionicons name="cart" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.title}>Nova Lista de Compras</Text>
                <TouchableOpacity onPress={handleCancel} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.description}>
                Dê um nome para a sua lista de compras ou deixe em branco para usar o mês atual.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome da lista (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Ex: ${defaultName}`}
                  placeholderTextColor={theme.colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCreate}
                />
              </View>

              <View style={styles.hintContainer}>
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.hintText}>
                  Nome padrão caso vazio:{' '}
                  <Text style={styles.hintHighlight}>{defaultName}</Text>
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelBtn]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.submitBtn]}
                  onPress={handleCreate}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.submitBtnText}>Criar e Abrir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 420,
  },
  modalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.text,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xl,
    gap: 6,
  },
  hintText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  hintHighlight: {
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  cancelBtn: {
    backgroundColor: theme.colors.background,
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    flex: 1,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
