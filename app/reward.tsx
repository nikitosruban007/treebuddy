import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { translate } from '@/constants/translations';
import { useAuth } from '@/contexts/AuthContext';
import { TASKS } from '@/constants/tasks';
import { getTreeStageByXP } from '@/constants/treeStages';
import { pickPositiveReaction } from '@/utils/reactions';
import { formatDurationShort, getMsUntilTomorrow } from '@/utils/date';
import { useSettings } from '@/contexts/SettingsContext';

export default function RewardScreen() {
  const { taskId, xp, newXP, lang } = useLocalSearchParams();
  const { userData } = useAuth();
  const { settings } = useSettings();

  const task = useMemo(() => {
    for (const t of TASKS) {
      if (t.id === taskId) return t;
    }
    return undefined;
  }, [taskId]);
  const gainedXP = typeof xp === 'string' ? Number(xp) : Array.isArray(xp) ? Number(xp[0]) : 0;
  const xpAfter = typeof newXP === 'string' ? Number(newXP) : userData?.xp || 0;

  const stage = getTreeStageByXP(isFinite(xpAfter as any) ? xpAfter : (userData?.xp || 0));
  const language = (lang === 'en' || lang === 'ua') ? lang : settings.language;
  const reaction = pickPositiveReaction({ language, taskTitle: task?.title });

  const timeLeft = formatDurationShort(getMsUntilTomorrow());
  const streak = userData?.streakCount || 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{translate('reward_title', language)}</Text>
        <Text style={styles.reaction}>{reaction}</Text>

        <View style={styles.treeBox}>
          <Text style={styles.treeEmoji}>{stage.image}</Text>
          <Text style={styles.treeName}>{stage.name}</Text>
          <Text style={styles.treeMeta}>Рівень {stage.level} • {xpAfter} XP</Text>
        </View>

        <View style={styles.xpRow}>
          <Text style={styles.xpPlus}>+{gainedXP}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>

        <View style={styles.streakRow}>
          <Text style={styles.streakText}>🔥 {translate('streak_label', language)}: {streak}</Text>
        </View>

        <View style={styles.returnBox}>
          <Text style={styles.returnTitle}>{translate('tasks_new_tomorrow', language)}</Text>
          <Text style={styles.returnText}>{translate('tasks_time_left', language)}: {timeLeft}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/tasks')}>
          <Text style={styles.buttonText}>{translate('reward_button', language)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  reaction: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  treeBox: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.primary + '10',
    marginBottom: 16,
  },
  treeEmoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  treeName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  treeMeta: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  xpPlus: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.accent,
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  streakRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  returnBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  returnTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  returnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '700',
  },
});
