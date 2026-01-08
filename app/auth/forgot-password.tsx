
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { translate } from '@/constants/translations';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Помилка', 'Введіть email');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(
        'Успіх',
        translate('auth_reset_sent', 'ua'),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Reset password error:', error);
      Alert.alert('Помилка', error.message || 'Не вдалося надіслати лист');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>🔑</Text>
        <Text style={styles.title}>{translate('auth_reset_password', 'ua')}</Text>
        <Text style={styles.subtitle}>Введіть email для відновлення паролю</Text>

        <TextInput
          style={styles.input}
          placeholder={translate('auth_email', 'ua')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? translate('common_loading', 'ua') : translate('auth_reset_password', 'ua')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.linkText}>{translate('auth_back_to_login', 'ua')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 40,
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
});
