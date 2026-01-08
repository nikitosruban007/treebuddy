
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { translate } from '@/constants/translations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getTreeStageByXP, getProgressToNextLevel } from '@/constants/treeStages';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSettings } from '@/contexts/SettingsContext';

export default function TreeScreen() {
  const { userData } = useAuth();
  const { settings } = useSettings();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{translate('common_loading', 'ua')}</Text>
      </View>
    );
  }

  const treeStage = getTreeStageByXP(userData.xp);
  const progress = getProgressToNextLevel(userData.xp);
  const streak = userData.streakCount || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{translate('tree_title', 'ua')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.treeContainer, animatedStyle]}>
          <Text style={styles.treeEmoji}>{treeStage.image}</Text>
        </Animated.View>

        <Text style={styles.stageName}>{treeStage.name}</Text>
        <Text style={styles.levelText}>
          {translate('tree_level', 'ua')} {treeStage.level}
        </Text>

        <View style={styles.streakRow}>
          <MaterialCommunityIcons name="fire" size={18} color={colors.accent} />
          <Text style={styles.streakText}>{translate('streak_label', settings.language)}: {streak}</Text>
        </View>

        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>{userData.xp} XP</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {treeStage.maxXP === Infinity 
              ? 'Максимальний рівень!' 
              : `${translate('tree_next_level', 'ua')}: ${treeStage.maxXP + 1 - userData.xp} XP`}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="check-circle" size={32} color={colors.success} />
            <Text style={styles.statValue}>{userData.completedTasks?.length || 0}</Text>
            <Text style={styles.statLabel}>Завдань виконано</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star" size={32} color={colors.accent} />
            <Text style={styles.statValue}>{userData.xp}</Text>
            <Text style={styles.statLabel}>Загальний XP</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  treeContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  treeEmoji: {
    fontSize: 120,
  },
  stageName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  levelText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  xpContainer: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 30,
  },
  xpText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: colors.greyLight,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 100,
  },
});
