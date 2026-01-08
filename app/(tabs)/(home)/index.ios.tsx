
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { translate } from '@/constants/translations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getTreeStageByXP } from '@/constants/treeStages';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HomeScreen() {
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading]);

  if (loading || !userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{translate('common_loading', 'ua')}</Text>
      </View>
    );
  }

  const treeStage = getTreeStageByXP(userData.xp);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Вітаємо! 👋</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>{userData.xp}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.treeCard}>
          <Text style={styles.treeEmoji}>{treeStage.image}</Text>
          <Text style={styles.treeName}>{treeStage.name}</Text>
          <Text style={styles.treeLevel}>Рівень {treeStage.level}</Text>
        </Animated.View>

        <View style={styles.menuGrid}>
          <Animated.View entering={FadeInDown.delay(200)}>
            <TouchableOpacity
              style={[styles.menuCard, { backgroundColor: colors.accent + '20' }]}
              onPress={() => router.push('/tasks')}
            >
              <MaterialCommunityIcons name="clipboard-list" size={40} color={colors.accent} />
              <Text style={styles.menuTitle}>{translate('home_tasks', 'ua')}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <TouchableOpacity
              style={[styles.menuCard, { backgroundColor: colors.primary + '20' }]}
              onPress={() => router.push('/tree')}
            >
              <MaterialCommunityIcons name="tree" size={40} color={colors.primary} />
              <Text style={styles.menuTitle}>{translate('home_tree', 'ua')}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <TouchableOpacity
              style={[styles.menuCard, { backgroundColor: colors.success + '20' }]}
              onPress={() => router.push('/statistics')}
            >
              <MaterialCommunityIcons name="chart-bar" size={40} color={colors.success} />
              <Text style={styles.menuTitle}>{translate('home_stats', 'ua')}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)}>
            <TouchableOpacity
              style={[styles.menuCard, { backgroundColor: colors.textSecondary + '20' }]}
              onPress={() => router.push('/settings')}
            >
              <MaterialCommunityIcons name="cog" size={40} color={colors.textSecondary} />
              <Text style={styles.menuTitle}>{translate('home_settings', 'ua')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  xpBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  xpText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  xpLabel: {
    fontSize: 12,
    color: colors.white,
  },
  treeCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  treeEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  treeName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  treeLevel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  menuCard: {
    width: (require('react-native').Dimensions.get('window').width - 56) / 2,
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 100,
  },
});
