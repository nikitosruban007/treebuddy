
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { translate } from '@/constants/translations';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isFirebaseConfigured } = useAuth();

  const handleRegister = async () => {
    if (!isFirebaseConfigured) {
      Alert.alert(
        '⚠️ Firebase не налаштовано',
        'Для використання автентифікації потрібно налаштувати Firebase. Будь ласка, додайте файли конфігурації Firebase до проекту.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!email || !password || !confirmPassword) {
      Alert.alert('Помилка', 'Заповніть всі поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Помилка', 'Паролі не співпадають');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Помилка', 'Пароль має бути не менше 6 символів');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      Alert.alert('Успіх', 'Акаунт створено!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('Помилка реєстрації', error.message || 'Не вдалося створити акаунт');
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
          <Text style={styles.emoji}>🌱</Text>
          <Text style={styles.title}>TreeBuddy</Text>
          <Text style={styles.subtitle}>{translate('auth_register', 'ua')}</Text>

          {!isFirebaseConfigured && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Firebase не налаштовано. Реєстрація недоступна.
              </Text>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder={translate('auth_email', 'ua')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading && isFirebaseConfigured}
          />

          <TextInput
            style={styles.input}
            placeholder={translate('auth_password', 'ua')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading && isFirebaseConfigured}
          />

          <TextInput
            style={styles.input}
            placeholder="Підтвердіть пароль"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading && isFirebaseConfigured}
          />

          <TouchableOpacity
            style={[styles.button, (loading || !isFirebaseConfigured) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading || !isFirebaseConfigured}
          >
            <Text style={styles.buttonText}>
              {loading ? translate('common_loading', 'ua') : translate('auth_register', 'ua')}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.linkText}>{translate('auth_have_account', 'ua')}</Text>
          </TouchableOpacity>
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
});
