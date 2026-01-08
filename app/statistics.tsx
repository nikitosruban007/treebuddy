
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { translate } from '@/constants/translations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getTreeStageByXP } from '@/constants/treeStages';
import { TASKS } from '@/constants/tasks';
import { toDate } from '@/utils/date';
import { firestoreService } from '@/services/firebase';
import { getDemoCommunityProgress } from '@/utils/communityProgress';

export default function StatisticsScreen() {
  const { userData } = useAuth();
  const [community, setCommunity] = useState<{ totalXP: number; totalActions: number } | null>(null);
  const [communityLoading, setCommunityLoading] = useState(true);

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{translate('common_loading', 'ua')}</Text>
      </View>
    );
  }

  const treeStage = getTreeStageByXP(userData.xp);
  const completedTasks = userData.completedTasks || [];

  const taskMap = useMemo(() => {
    const map = new Map<string, (typeof TASKS)[number]>();
    for (const t of TASKS) map.set(t.id, t);
    return map;
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await firestoreService.getCommunityProgress();
        if (data) {
          if (mounted) setCommunity(data);
          return;
        }
        const demo = await getDemoCommunityProgress();
        if (mounted) setCommunity(demo);
      } finally {
        if (mounted) setCommunityLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{translate('stats_title', 'ua')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.communitySection}>
          <Text style={styles.sectionTitle}>{translate('stats_community_title', 'ua')}</Text>
          {communityLoading ? (
            <View style={styles.communityCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.communityLoadingText}>{translate('common_loading', 'ua')}</Text>
            </View>
          ) : (
            <View style={styles.communityCard}>
              <View style={styles.communityLeft}>
                <Text style={styles.communityEmoji}>🌳</Text>
              </View>
              <View style={styles.communityInfo}>
                <Text style={styles.communityMain}>
                  {translate('stats_community_actions', 'ua')}: {community?.totalActions ?? 0}
                </Text>
                <Text style={styles.communitySub}>
                  {translate('stats_community_xp', 'ua')}: {community?.totalXP ?? 0}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.statsOverview}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star" size={40} color={colors.accent} />
            <Text style={styles.statValue}>{userData.xp}</Text>
            <Text style={styles.statLabel}>{translate('stats_total_xp', 'ua')}</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="check-circle" size={40} color={colors.success} />
            <Text style={styles.statValue}>{completedTasks.length}</Text>
            <Text style={styles.statLabel}>{translate('stats_completed_tasks', 'ua')}</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="tree" size={40} color={colors.primary} />
            <Text style={styles.statValue}>{treeStage.level}</Text>
            <Text style={styles.statLabel}>{translate('stats_tree_level', 'ua')}</Text>
          </View>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>{translate('stats_history', 'ua')}</Text>
          
          {completedTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="history" size={64} color={colors.greyLight} />
              <Text style={styles.emptyText}>{translate('stats_no_history', 'ua')}</Text>
            </View>
          ) : (
            completedTasks.slice().reverse().map((task, index) => (
              <View key={`${task.taskId}-${index}`} style={styles.historyCard}>
                <View style={styles.historyIcon}>
                  <MaterialCommunityIcons name="check" size={20} color={colors.success} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTask}>{taskMap.get(task.taskId)?.title || task.taskId}</Text>
                  <Text style={styles.historyDate}>
                    {(() => {
                      const d = toDate(task.completedAt);
                      return d ? d.toLocaleDateString('uk-UA') : 'Сьогодні';
                    })()}
                  </Text>
                </View>
                <View style={styles.historyXp}>
                  <Text style={styles.historyXpText}>+{task.xpEarned}</Text>
                  <Text style={styles.historyXpLabel}>XP</Text>
                </View>
              </View>
            ))
          )}
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  communitySection: {
    marginBottom: 20,
  },
  statsOverview: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
    gap: 12,
  },
  communityLeft: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '15',
  },
  communityEmoji: {
    fontSize: 30,
  },
  communityInfo: {
    flex: 1,
  },
  communityMain: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  communitySub: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  communityLoadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
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
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  historySection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTask: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  historyXp: {
    alignItems: 'center',
  },
  historyXpText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  historyXpLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 100,
  },
});
