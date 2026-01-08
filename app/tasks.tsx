
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { TASKS } from '@/constants/tasks';
import { translate } from '@/constants/translations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getDailyPlan, getDailyProgress, getDailySummary, DailyTaskInstance } from '@/utils/dailyTasks';
import { formatDurationShort, getMsUntilTomorrow, getTodayKey } from '@/utils/date';
import { useSettings } from '@/contexts/SettingsContext';

export default function TasksScreen() {
  const { user, userData, isDemoMode } = useAuth();
  const { settings } = useSettings();
  const [plan, setPlan] = useState<DailyTaskInstance[] | null>(null);
  const [loading, setLoading] = useState(true);
  const dateKey = useMemo(() => getTodayKey(), []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const seed = isDemoMode ? 'demo' : (user?.uid || userData?.email || 'guest');
        const p = await getDailyPlan({ dateKey, userSeed: seed, language: settings.language });
        if (mounted) setPlan(p);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [dateKey, isDemoMode, user?.uid, userData?.email, settings.language]);

  const handleTaskPress = (taskId: string, xpReward: number) => {
    router.push(`/camera?taskId=${taskId}&xpReward=${xpReward}&dateKey=${dateKey}`);
  };

  const completedTasks = userData?.completedTasks || [];
  const dailySummary = plan
    ? getDailySummary({ plan, completedTasks, dateKey })
    : { doneTasks: 0, totalTasks: 3, totalCompletions: 0 };

  const timeLeft = formatDurationShort(getMsUntilTomorrow());
  const streak = userData?.streakCount || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{translate('tasks_title', settings.language)}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.todayHeader}>
          <Text style={styles.todayTitle}>{translate('tasks_today', settings.language)}</Text>
          <View style={styles.todayMetaRow}>
            <View style={styles.todayMeta}>
              <Text style={styles.todayMetaText}>
                {translate('tasks_done', settings.language)}: {dailySummary.doneTasks}/{dailySummary.totalTasks}
              </Text>
            </View>
            <View style={styles.streakPill}>
              <MaterialCommunityIcons name="fire" size={16} color={colors.accent} />
              <Text style={styles.streakText}>{translate('streak_label', settings.language)}: {streak}</Text>
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>{translate('common_loading', settings.language)}</Text>
          </View>
        )}

        {!loading && plan && plan.map((item) => {
          const task = TASKS.find((t) => t.id === item.taskId);
          if (!task) return null;

          const doneCount = getDailyProgress({
            completedTasks,
            dateKey,
            taskId: item.taskId,
          });
          const isDone = doneCount >= item.requiredCount;

          return (
            <TouchableOpacity
              key={`${dateKey}:${item.taskId}`}
              style={[styles.taskCard, isDone && styles.taskCardDone]}
              onPress={() => handleTaskPress(item.taskId, item.xpPerCompletion)}
              disabled={isDone}
            >
              <View style={styles.taskIcon}>
                <MaterialCommunityIcons name={task.icon as any} size={32} color={isDone ? colors.success : colors.primary} />
              </View>

              <View style={styles.taskInfo}>
                <View style={styles.taskRowTop}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={[styles.difficultyPill, item.labelKey === 'easy' ? styles.pillEasy : item.labelKey === 'medium' ? styles.pillMedium : styles.pillHard]}>
                    <Text style={styles.difficultyText}>
                      {item.labelKey === 'easy'
                        ? translate('difficulty_easy', settings.language)
                        : item.labelKey === 'medium'
                          ? translate('difficulty_medium', settings.language)
                          : translate('difficulty_hard', settings.language)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.taskDescription}>{item.conditionText}</Text>

                <View style={styles.progressLine}>
                  <View style={styles.progressBarSmall}>
                    <View style={[styles.progressFillSmall, { width: `${Math.min(100, (doneCount / item.requiredCount) * 100)}%` }]} />
                  </View>
                  <Text style={styles.progressLabelSmall}>{doneCount}/{item.requiredCount}</Text>
                </View>
              </View>

              <View style={[styles.xpBadge, isDone && styles.xpBadgeDone]}>
                <Text style={styles.xpText}>+{item.xpPerCompletion}</Text>
                <Text style={styles.xpLabel}>XP</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {!loading && plan && (
          <View style={styles.returnBox}>
            <Text style={styles.returnTitle}>{translate('tasks_new_tomorrow', settings.language)}</Text>
            <Text style={styles.returnText}>
              {translate('tasks_time_left', settings.language)}: {timeLeft}
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  todayMeta: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  todayMetaText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  loadingBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  taskCardDone: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: colors.success + '55',
  },
  taskIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.seedling + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  taskInfo: {
    flex: 1,
  },
  taskRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  difficultyPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillEasy: {
    backgroundColor: colors.success + '20',
  },
  pillMedium: {
    backgroundColor: colors.accent + '20',
  },
  pillHard: {
    backgroundColor: colors.primary + '20',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  progressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  progressBarSmall: {
    flex: 1,
    height: 8,
    backgroundColor: colors.greyLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  progressLabelSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    width: 44,
    textAlign: 'right',
  },
  xpBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  xpBadgeDone: {
    backgroundColor: colors.success,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  xpLabel: {
    fontSize: 12,
    color: colors.white,
    marginTop: 2,
  },
  returnBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  returnTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  returnText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  todayMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
});
