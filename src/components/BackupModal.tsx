import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLists } from '../contexts/ListContext';
import { sendBackupToEmail, createBackupPayload } from '../services/backup';
import { theme } from '../constants/theme';
import { formatCurrency } from '../utils/formatters';

interface BackupModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const { lists, restoreFromBackup } = useLists();
  const [isExporting, setIsExporting] = useState(false);
  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  if (!user) return null;

  const totalItems = lists.reduce((acc, l) => acc + l.items.length, 0);
  const totalValue = lists.reduce(
    (acc, l) => acc + l.items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0),
    0
  );

  const handleSendEmail = async () => {
    try {
      setIsExporting(true);
      const res = await sendBackupToEmail(user, lists);
      if (res.success) {
        Alert.alert(
          'Sucesso!',
          `Backup preparado para envio para ${user.email}. Seus dados estão seguros e você pode utilizá-los para restaurar em outro celular quando quiser!`
        );
        onClose();
      }
    } catch (error: any) {
      Alert.alert('Erro ao enviar', error?.message || 'Falha ao processar o envio.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareText = async () => {
    try {
      const payload = createBackupPayload(user, lists);
      await Share.share({
        title: 'Backup Listas de Compras',
        message: JSON.stringify(payload, null, 2),
      });
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Erro ao compartilhar texto');
    }
  };

  const handleImport = async () => {
    if (!importJsonText.trim()) {
      Alert.alert('Atenção', 'Cole o texto do arquivo de backup (JSON) para restaurar.');
      return;
    }

    try {
      setIsImporting(true);
      const parsed = JSON.parse(importJsonText.trim());
      if (!parsed.lists || !Array.isArray(parsed.lists)) {
        throw new Error('O formato dos dados não é válido.');
      }

      await restoreFromBackup(parsed);
      Alert.alert(
        'Restauração concluída!',
        `${parsed.lists.length} listas foram importadas com sucesso para este celular.`
      );
      setImportJsonText('');
      onClose();
    } catch (err: any) {
      Alert.alert(
        'Erro na restauração',
        'Não foi possível ler o backup. Certifique-se de que copiou o código JSON completo.'
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="cloud-upload" size={24} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Backup & Migração</Text>
              <Text style={styles.subtitle}>
                Troca de celular ou envio por e-mail
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Mode Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'export' && styles.tabActive]}
              onPress={() => setMode('export')}
            >
              <Text style={[styles.tabText, mode === 'export' && styles.tabTextActive]}>
                Exportar / E-mail
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'import' && styles.tabActive]}
              onPress={() => setMode('import')}
            >
              <Text style={[styles.tabText, mode === 'import' && styles.tabTextActive]}>
                Restaurar Backup
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {mode === 'export' ? (
              <>
                <View style={styles.privacyNotice}>
                  <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
                  <Text style={styles.privacyText}>
                    Seus dados ficam 100% no seu celular. Ao enviar por e-mail, você cria uma cópia de segurança própria para restaurar quando trocar de aparelho.
                  </Text>
                </View>

                {/* Summary Box */}
                <View style={styles.statsCard}>
                  <Text style={styles.statsTitle}>Resumo do que será exportado:</Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Destinatário:</Text>
                    <Text style={styles.statValueBold}>{user.email}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Total de listas:</Text>
                    <Text style={styles.statValue}>{lists.length}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Total de itens:</Text>
                    <Text style={styles.statValue}>{totalItems}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Valor total acumulado:</Text>
                    <Text style={styles.statValueHighlight}>{formatCurrency(totalValue)}</Text>
                  </View>
                </View>

                {/* Send button */}
                <TouchableOpacity
                  style={[styles.mainButton, isExporting && styles.btnDisabled]}
                  onPress={handleSendEmail}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="mail" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.mainButtonText}>Enviar para {user.email}</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Secondary options */}
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleShareText}
                  disabled={isExporting}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={18}
                    color={theme.colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.secondaryButtonText}>
                    Compartilhar arquivo / código JSON
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.importDesc}>
                  Se você trocou de celular e recebeu o backup por e-mail, cole o conteúdo do arquivo JSON abaixo para restaurar todas as suas listas:
                </Text>

                <TextInput
                  style={styles.jsonInput}
                  placeholder="Cole aqui o texto do arquivo JSON de backup..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={importJsonText}
                  onChangeText={setImportJsonText}
                  multiline
                  numberOfLines={6}
                />

                <TouchableOpacity
                  style={[styles.mainButton, isImporting && styles.btnDisabled]}
                  onPress={handleImport}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons
                        name="cloud-download-outline"
                        size={20}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.mainButtonText}>Restaurar Listas</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
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
  modalCard: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
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
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  tabActive: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primaryDark,
  },
  scroll: {
    paddingBottom: theme.spacing.lg,
  },
  privacyNotice: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primarySoft,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: 10,
    alignItems: 'flex-start',
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  statsCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statValueHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    marginBottom: theme.spacing.sm,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  importDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  jsonInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    fontSize: 13,
    color: theme.colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.lg,
  },
});
