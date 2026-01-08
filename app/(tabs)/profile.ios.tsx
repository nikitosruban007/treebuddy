
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { getTreeStageByXP } from "@/constants/treeStages";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/styles/commonStyles";

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, userData, isDemoMode } = useAuth();

  if (!userData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Завантаження...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const treeStage = getTreeStageByXP(userData.xp);
  const displayEmail = isDemoMode ? 'Демо-режим 🎮' : (user?.email || userData.email || 'Гість');
  const completedTasksCount = userData.completedTasks?.length || 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {isDemoMode && (
          <View style={styles.demoBanner}>
            <MaterialCommunityIcons name="information" size={20} color={colors.accent} />
            <Text style={styles.demoBannerText}>
              Ви використовуєте демо-режим. Дані зберігаються локально.
            </Text>
          </View>
        )}

        <GlassView style={styles.profileHeader} glassEffectStyle="regular">
          <View style={styles.avatarContainer}>
            <IconSymbol 
              ios_icon_name="person.circle.fill" 
              android_material_icon_name="person" 
              size={80} 
              color={theme.colors.primary} 
            />
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {isDemoMode ? 'Демо користувач' : 'TreeBuddy користувач'}
          </Text>
          <Text style={[styles.email, { color: theme.dark ? '#98989D' : '#666' }]}>
            {displayEmail}
          </Text>
        </GlassView>

        <GlassView style={styles.statsCard} glassEffectStyle="regular">
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Статистика</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.accent + '20' }]}>
                <MaterialCommunityIcons name="star" size={28} color={colors.accent} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{userData.xp}</Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>XP</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <MaterialCommunityIcons name="tree" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>Рівень {treeStage.level}</Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>{treeStage.name}</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.success + '20' }]}>
                <MaterialCommunityIcons name="check-circle" size={28} color={colors.success} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{completedTasksCount}</Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Завдань</Text>
            </View>
          </View>
        </GlassView>

        <GlassView style={styles.section} glassEffectStyle="regular">
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Дії</Text>
          
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={() => router.push('/statistics')}
          >
            <View style={styles.actionLeft}>
              <MaterialCommunityIcons name="chart-bar" size={24} color={theme.dark ? '#98989D' : '#666'} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Детальна статистика</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.dark ? '#98989D' : '#666'} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionRow}
            onPress={() => router.push('/tree')}
          >
            <View style={styles.actionLeft}>
              <MaterialCommunityIcons name="tree" size={24} color={theme.dark ? '#98989D' : '#666'} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Моє дерево</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.dark ? '#98989D' : '#666'} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionRow}
            onPress={() => router.push('/settings')}
          >
            <View style={styles.actionLeft}>
              <MaterialCommunityIcons name="cog" size={24} color={theme.dark ? '#98989D' : '#666'} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Налаштування</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.dark ? '#98989D' : '#666'} />
          </TouchableOpacity>
        </GlassView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '15',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  demoBannerText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 32,
    marginBottom: 16,
    gap: 12,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    borderRadius: 16,
    padding: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 16,
  },
});
