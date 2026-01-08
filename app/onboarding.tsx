
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { translate } from '@/constants/translations';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

const ONBOARDING_KEY = '@treebuddy_onboarding_complete';

const slides = [
  {
    title: 'onboarding_welcome_title',
    text: 'onboarding_welcome_text',
    emoji: '🌳',
  },
  {
    title: 'onboarding_actions_title',
    text: 'onboarding_actions_text',
    emoji: '♻️',
  },
  {
    title: 'onboarding_camera_title',
    text: 'onboarding_camera_text',
    emoji: '📸',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { enableDemoMode, isFirebaseConfigured } = useAuth();

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  const startDemo = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      await enableDemoMode();
      // Go straight to first action
      router.replace('/tasks');
    } catch (error) {
      console.error('Error starting demo:', error);
      // fallback
      router.replace('/auth/login');
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // На останньому слайді не викликаємо completeOnboarding
      // Користувач має вибрати "Почати" або "Увійти"
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.container}>
      <Animated.View 
        key={currentSlide}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={styles.slideContainer}
      >
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{translate(slide.title, 'ua')}</Text>
        <Text style={styles.text}>{translate(slide.text, 'ua')}</Text>
      </Animated.View>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSlide && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {currentSlide < slides.length - 1 && (
          <TouchableOpacity onPress={skipOnboarding} style={styles.skipButton}>
            <Text style={styles.skipText}>{translate('onboarding_skip', 'ua')}</Text>
          </TouchableOpacity>
        )}

        {currentSlide === slides.length - 1 ? (
          <>
            <TouchableOpacity onPress={startDemo} style={styles.nextButton}>
              <Text style={styles.nextText}>{translate('onboarding_start', 'ua')}</Text>
            </TouchableOpacity>

            {isFirebaseConfigured && (
              <TouchableOpacity onPress={completeOnboarding} style={styles.loginButton}>
                <Text style={styles.loginText}>{translate('onboarding_login', 'ua')}</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity onPress={nextSlide} style={styles.nextButton}>
            <Text style={styles.nextText}>{translate('onboarding_next', 'ua')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emoji: {
    fontSize: 120,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.greyLight,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 30,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 40,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  skipText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
  },
  loginButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
