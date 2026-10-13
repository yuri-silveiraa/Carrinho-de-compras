import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ShoppingList } from '../types';
import { useLists } from '../contexts/ListContext';
import { Header } from '../components/Header';
import { ShoppingListCard } from '../components/ShoppingListCard';
import { CreateListModal } from '../components/CreateListModal';
import { theme } from '../constants/theme';
import { getDefaultListName } from '../utils/date';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { lists, isLoading, createList, deleteList, refreshLists } = useLists();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const defaultSuggestedName = getDefaultListName();

  const handleCreateList = async (customName?: string) => {
    try {
      const newList = await createList(customName);
      // Navigates directly to the second screen (shopping list detail)
      navigation.navigate('ListDetail', {
        listId: newList.id,
        listName: newList.name,
      });
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Falha ao criar lista.');
    }
  };

  const handleConfirmDelete = (list: ShoppingList) => {
    Alert.alert(
      'Excluir lista',
      `Tem certeza que deseja apagar a lista "${list.name}" com ${list.items.length} itens?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteList(list.id),
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLists();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <View style={styles.container}>
        {/* Top Button to Create New List */}
        <View style={styles.topActionContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.createButtonContent}>
              <View style={styles.plusIconWrap}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.createButtonTitle}>Criar Nova Lista</Text>
                <Text style={styles.createButtonSubtitle}>
                  Sugestão rápida: {defaultSuggestedName}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Minhas Listas</Text>
          <Text style={styles.sectionSubtitle}>
            Ordenadas da mais nova para a mais antiga
          </Text>
        </View>

        {/* Lists Container */}
        {isLoading && lists.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando suas listas...</Text>
          </View>
        ) : (
          <FlatList
            data={lists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            renderItem={({ item }) => (
              <ShoppingListCard
                list={item}
                onPress={() =>
                  navigation.navigate('ListDetail', {
                    listId: item.id,
                    listName: item.name,
                  })
                }
                onDelete={() => handleConfirmDelete(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="basket-outline" size={48} color={theme.colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>Nenhuma lista criada ainda</Text>
                <Text style={styles.emptyDescription}>
                  Toque no botão verde acima para criar a sua primeira lista de compras!
                </Text>
                <TouchableOpacity
                  style={styles.emptyCreateBtn}
                  onPress={() => setCreateModalVisible(true)}
                >
                  <Text style={styles.emptyCreateBtnText}>
                    Criar lista ({defaultSuggestedName})
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      <CreateListModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  topActionContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  plusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  createButtonSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  emptyCreateBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  emptyCreateBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
});
