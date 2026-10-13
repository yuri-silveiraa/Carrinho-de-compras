import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';
import { BackupModal } from './BackupModal';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [backupVisible, setBackupVisible] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair? Suas listas permanecerão salvas com segurança no armazenamento deste celular.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.userInfo}>
          {user?.photoUrl ? (
            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}

          <View style={styles.textDetails}>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] || 'Usuário'}</Text>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email || 'Armazenamento Local'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setBackupVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="cloud-upload-outline" size={22} color={theme.colors.primaryDark} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.logoutBtn]}
            onPress={handleSignOut}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="log-out-outline" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <BackupModal visible={backupVisible} onClose={() => setBackupVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  textDetails: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  email: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    backgroundColor: theme.colors.background,
  },
});
