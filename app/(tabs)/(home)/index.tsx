
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { translate } from '@/constants/translations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getTreeStageByXP } from '@/constants/treeStages';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '@/contexts/SettingsContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 56) / 2;

export default function HomeScreen() {
  const { user, userData, loading, isDemoMode } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    if (!loading && !user && !isDemoMode) {
      console.log('No user and not in demo mode, redirecting to login');
      router.replace('/auth/login');
    }
  }, [user, loading, isDemoMode]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{translate('common_loading', 'ua')}</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{translate('common_loading', 'ua')}</Text>
      </View>
    );
  }

  const treeStage = getTreeStageByXP(userData.xp);
  const displayEmail = isDemoMode ? 'Демо-режим 🎮' : (user?.email || 'Гість');
  const streak = userData.streakCount || 0;
  const nextLevelXP = treeStage.maxXP;
  const currentLevelXP = treeStage.minXP;
  const progress = ((userData.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Вітаємо! 👋</Text>
            <Text style={styles.email}>{displayEmail}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.streakBadge}>
              <MaterialCommunityIcons name="fire" size={18} color={colors.white} />
              <Text style={styles.streakText}>{translate('streak_label', settings.language)}: {streak}</Text>
            </View>
            <TouchableOpacity 
              style={styles.xpBadge}
              onPress={() => router.push('/statistics')}
            >
              <MaterialCommunityIcons name="star" size={20} color={colors.white} />
              <Text style={styles.xpText}>{userData.xp}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.treeCard}>
          <LinearGradient
            colors={[colors.primary + '15', colors.accent + '15']}
            style={styles.treeCardGradient}
          >
            <Text style={styles.treeEmoji}>{treeStage.image}</Text>
            <Text style={styles.treeName}>{treeStage.name}</Text>
            <Text style={styles.treeLevel}>Рівень {treeStage.level}</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {userData.xp} / {nextLevelXP} XP
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.menuGrid}>
          <Animated.View entering={FadeInDown.delay(200)}>
            <TouchableOpacity
              style={[styles.menuCard, { width: cardWidth }]}
              onPress={() => {
                console.log('Tasks button pressed');
                router.push('/tasks');
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                <MaterialCommunityIcons name="clipboard-list" size={32} color={colors.accent} />
              </View>
              <Text style={styles.menuTitle}>{translate('home_tasks', 'ua')}</Text>
              <Text style={styles.menuSubtitle}>Виконуйте завдання</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <TouchableOpacity
              style={[styles.menuCard, { width: cardWidth }]}
              onPress={() => {
                console.log('Tree button pressed');
                router.push('/tree');
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <MaterialCommunityIcons name="tree" size={32} color={colors.primary} />
              </View>
              <Text style={styles.menuTitle}>{translate('home_tree', 'ua')}</Text>
              <Text style={styles.menuSubtitle}>Ваше дерево</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <TouchableOpacity
              style={[styles.menuCard, { width: cardWidth }]}
              onPress={() => {
                console.log('Statistics button pressed');
                router.push('/statistics');
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
                <MaterialCommunityIcons name="chart-bar" size={32} color={colors.success} />
              </View>
              <Text style={styles.menuTitle}>{translate('home_stats', 'ua')}</Text>
              <Text style={styles.menuSubtitle}>Ваш прогрес</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)}>
            <TouchableOpacity
              style={[styles.menuCard, { width: cardWidth }]}
              onPress={() => {
                console.log('Settings button pressed');
                router.push('/settings');
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.textSecondary + '20' }]}>
                <MaterialCommunityIcons name="cog" size={32} color={colors.textSecondary} />
              </View>
              <Text style={styles.menuTitle}>{translate('home_settings', 'ua')}</Text>
              <Text style={styles.menuSubtitle}>Налаштування</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {isDemoMode && (
          <Animated.View entering={FadeInDown.delay(600)} style={styles.demoNotice}>
            <MaterialCommunityIcons name="information" size={20} color={colors.accent} />
            <Text style={styles.demoNoticeText}>
              Ви в демо-режимі. Дані зберігаються локально.
            </Text>
          </Animated.View>
        )}
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
    paddingTop: Platform.OS === 'android' ? 60 : 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 10,
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
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    boxShadow: '0px 4px 12px rgba(124, 179, 66, 0.3)',
    elevation: 4,
  },
  streakBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    boxShadow: '0px 4px 12px rgba(45, 80, 22, 0.25)',
    elevation: 3,
  },
  streakText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '800',
  },
  xpText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  xpLabel: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  treeCard: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
    elevation: 6,
  },
  treeCardGradient: {
    padding: 32,
    alignItems: 'center',
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
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.greyLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    minHeight: 160,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 100,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '15',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  demoNoticeText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
});
