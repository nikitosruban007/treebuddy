
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { translate } from '@/constants/translations';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isFirebaseConfigured, enableDemoMode } = useAuth();

  const handleLogin = async () => {
    if (!isFirebaseConfigured) {
      Alert.alert(
        '⚠️ Firebase не налаштовано',
        'Для використання автентифікації потрібно налаштувати Firebase. Будь ласка, додайте файли конфігурації Firebase до проекту.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!email || !password) {
      Alert.alert('Помилка', 'Заповніть всі поля');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Помилка входу', error.message || 'Не вдалося увійти');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLogin = async () => {
    console.log('Skip login button pressed');
    
    setLoading(true);
    try {
      await enableDemoMode();
      console.log('Demo mode enabled, navigating to tabs');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error enabling demo mode:', error);
      Alert.alert('Помилка', 'Не вдалося увійти в демо-режим');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🌳</Text>
          <Text style={styles.title}>TreeBuddy</Text>
          <Text style={styles.subtitle}>{translate('auth_login', 'ua')}</Text>

          {!isFirebaseConfigured && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Firebase не налаштовано. Ви можете продовжити в демо-режимі.
              </Text>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder={translate('auth_email', 'ua')}
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading && isFirebaseConfigured}
          />

          <TextInput
            style={styles.input}
            placeholder={translate('auth_password', 'ua')}
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading && isFirebaseConfigured}
          />

          <TouchableOpacity
            style={[styles.button, (loading || !isFirebaseConfigured) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || !isFirebaseConfigured}
          >
            <Text style={styles.buttonText}>
              {loading ? translate('common_loading', 'ua') : translate('auth_login', 'ua')}
            </Text>
          </TouchableOpacity>

          {isFirebaseConfigured && (
            <TouchableOpacity
              onPress={() => router.push('/auth/forgot-password')}
              disabled={loading}
            >
              <Text style={styles.linkText}>{translate('auth_forgot_password', 'ua')}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {isFirebaseConfigured ? (
            <TouchableOpacity
              onPress={() => router.push('/auth/register')}
              disabled={loading}
            >
              <Text style={styles.linkText}>{translate('auth_no_account', 'ua')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipLogin}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>
                {loading ? 'Завантаження...' : 'Продовжити без входу (Демо)'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 40,
  },
  warningBox: {
    width: '100%',
    backgroundColor: '#FFF3CD',
    borderColor: '#FFC107',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
    marginTop: 16,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  skipButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  skipButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '600',
  },
});
