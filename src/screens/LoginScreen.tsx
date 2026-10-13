import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, signInWithQuickGoogle, isGoogleConfigured, isLoading } = useAuth();
  const [quickModalVisible, setQuickModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      if (isGoogleConfigured) {
        await signInWithGoogle();
      } else {
        // Open quick login modal
        setQuickModalVisible(true);
      }
    } catch (err: any) {
      if (err?.message === 'CONFIG_REQUIRED') {
        setQuickModalVisible(true);
      } else {
        Alert.alert('Aviso', 'Para testar o app rapidamente, utilize a entrada rápida do Google.');
        setQuickModalVisible(true);
      }
    }
  };

  const handleQuickSubmit = async () => {
    if (!userEmail.trim()) {
      Alert.alert('Atenção', 'Por favor, insira o seu e-mail do Google para receber seus backups.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signInWithQuickGoogle(
        userName.trim() || 'Usuário Google',
        userEmail.trim()
      );
      setQuickModalVisible(false);
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Falha ao autenticar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top visual graphic */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="cart" size={54} color={theme.colors.primary} />
          </View>
          <Text style={styles.appTitle}>Carrinho de Compras</Text>
          <Text style={styles.appTagline}>
            Suas listas de compras organizadas, rápidas e no controle total da sua mão.
          </Text>
        </View>

        {/* Feature badges */}
        <View style={styles.featuresCard}>
          <View style={styles.featureRow}>
            <View style={styles.featureIconWrap}>
              <Ionicons name="phone-portrait-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>Armazenamento Local Seguro</Text>
              <Text style={styles.featureDesc}>
                Seus dados não vão para nenhum banco em nuvem; ficam gravados no próprio celular.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.featureRow}>
            <View style={styles.featureIconWrap}>
              <Ionicons name="mail-unread-outline" size={20} color={theme.colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>Backup Direto no seu E-mail</Text>
              <Text style={styles.featureDesc}>
                Envie suas listas para o seu e-mail quando quiser trocar de celular.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.featureRow}>
            <View style={styles.featureIconWrap}>
              <Ionicons name="scale-outline" size={20} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>Itens por Peso e Unidade</Text>
              <Text style={styles.featureDesc}>
                Calcule carnes e frutas por kg ou produtos por unidade com facilidade.
              </Text>
            </View>
          </View>
        </View>

        {/* Auth CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <>
                <Ionicons name="logo-google" size={22} color="#EA4335" style={{ marginRight: 12 }} />
                <Text style={styles.googleButtonText}>Entrar com o Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoLoginBtn}
            onPress={() => setQuickModalVisible(true)}
          >
            <Text style={styles.demoLoginText}>
              {isGoogleConfigured ? 'Usar outro e-mail' : 'Configurar e-mail do Google'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Google Login Modal */}
        <Modal
          visible={quickModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setQuickModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Ionicons name="logo-google" size={26} color="#EA4335" />
                <Text style={styles.modalTitle}>Cadastro com Google</Text>
              </View>

              <Text style={styles.modalDesc}>
                Informe seus dados do Google. Eles serão salvos exclusivamente na memória deste celular e servirão para enviar backups ao seu e-mail.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Seu Nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Yuri Silveira"
                  placeholderTextColor={theme.colors.textMuted}
                  value={userName}
                  onChangeText={setUserName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Seu E-mail Google (Gmail)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seuemail@gmail.com"
                  placeholderTextColor={theme.colors.textMuted}
                  value={userEmail}
                  onChangeText={setUserEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setQuickModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleQuickSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSubmitText}>Continuar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: theme.spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
  },
  featuresCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  ctaSection: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
    width: '100%',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    width: '100%',
    paddingVertical: 16,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.md,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  demoLoginBtn: {
    padding: 8,
  },
  demoLoginText: {
    fontSize: 13,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: theme.spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 19,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
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
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  modalSubmitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
