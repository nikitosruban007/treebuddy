
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { translate } from '@/constants/translations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsScreen() {
  const { logout, isDemoMode, isFirebaseConfigured } = useAuth();
  const { settings, updateLanguage, updateTheme, updateSound, clearCache } = useSettings();
  const [clearing, setClearing] = useState(false);

  const handleLogout = () => {
    const logoutMessage = isDemoMode 
      ? 'Вийти з демо-режиму?' 
      : 'Вийти з акаунту?';
    
    const logoutDescription = isDemoMode
      ? 'Ваші локальні дані будуть видалені.'
      : 'Ви впевнені, що хочете вийти?';

    Alert.alert(
      logoutMessage,
      logoutDescription,
      [
        { text: translate('common_cancel', 'ua'), style: 'cancel' },
        {
          text: isDemoMode ? 'Вийти' : translate('settings_logout', 'ua'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Очистити кеш?',
      'Це очистить локальний кеш застосунку',
      [
        { text: translate('common_cancel', 'ua'), style: 'cancel' },
        {
          text: 'Очистити',
          onPress: async () => {
            setClearing(true);
            try {
              await clearCache();
              Alert.alert('Успіх', 'Кеш очищено');
            } catch (error) {
              console.error('Clear cache error:', error);
              Alert.alert('Помилка', 'Не вдалося очистити кеш');
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{translate('settings_title', 'ua')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {isDemoMode && (
          <View style={styles.demoNotice}>
            <MaterialCommunityIcons name="information" size={24} color={colors.accent} />
            <View style={styles.demoNoticeContent}>
              <Text style={styles.demoNoticeTitle}>Демо-режим активний</Text>
              <Text style={styles.demoNoticeText}>
                Ваші дані зберігаються локально. Увійдіть або зареєструйтесь для синхронізації.
              </Text>
            </View>
          </View>
        )}

        {!isFirebaseConfigured && !isDemoMode && (
          <View style={styles.warningNotice}>
            <MaterialCommunityIcons name="alert" size={24} color="#856404" />
            <View style={styles.warningNoticeContent}>
              <Text style={styles.warningNoticeTitle}>Firebase не налаштовано</Text>
              <Text style={styles.warningNoticeText}>
                Для використання автентифікації налаштуйте Firebase.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate('settings_language', 'ua')}</Text>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => updateLanguage('ua')}
          >
            <Text style={styles.settingText}>{translate('settings_ukrainian', 'ua')}</Text>
            {settings.language === 'ua' && (
              <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => updateLanguage('en')}
          >
            <Text style={styles.settingText}>{translate('settings_english', 'ua')}</Text>
            {settings.language === 'en' && (
              <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate('settings_theme', 'ua')}</Text>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => updateTheme('light')}
          >
            <Text style={styles.settingText}>{translate('settings_light', 'ua')}</Text>
            {settings.theme === 'light' && (
              <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => updateTheme('dark')}
          >
            <Text style={styles.settingText}>{translate('settings_dark', 'ua')}</Text>
            {settings.theme === 'dark' && (
              <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>{translate('settings_sound', 'ua')}</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={updateSound}
              trackColor={{ false: colors.greyLight, true: colors.accent }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleClearCache}
            disabled={clearing}
          >
            <Text style={styles.settingText}>{translate('settings_clear_cache', 'ua')}</Text>
            <MaterialCommunityIcons name="delete" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
            <Text style={styles.logoutText}>
              {isDemoMode ? 'Вийти з демо-режиму' : translate('settings_logout', 'ua')}
            </Text>
          </TouchableOpacity>
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
  demoNotice: {
    flexDirection: 'row',
    backgroundColor: colors.accent + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  demoNoticeContent: {
    flex: 1,
  },
  demoNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  demoNoticeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  warningNotice: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  warningNoticeContent: {
    flex: 1,
  },
  warningNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  warningNoticeText: {
    fontSize: 14,
    color: '#856404',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
