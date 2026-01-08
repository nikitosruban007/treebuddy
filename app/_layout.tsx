
import "react-native-reanimated";
import "react-native-url-polyfill/auto";
import React, { useCallback, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { notificationService } from "@/services/notifications";
import { useAuth } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "onboarding",
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const pathname = usePathname();
  const { user, loading: authLoading, isDemoMode } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  const checkInitialRoute = useCallback(async () => {
    try {
      const seen = await AsyncStorage.getItem('@treebuddy_onboarding_complete');
      setHasSeenOnboarding(seen === 'true');
    } catch (error) {
      console.error('Error checking initial route:', error);
      setHasSeenOnboarding(false);
    }
  }, []);

  useEffect(() => {
    checkInitialRoute();
    setupNotifications();
  }, [checkInitialRoute]);

  // On web, AsyncStorage updates won't automatically propagate into this state.
  // Re-check onboarding completion when the route changes so pressing "Почати" works.
  useEffect(() => {
    if (hasSeenOnboarding !== true) {
      checkInitialRoute();
    }
  }, [pathname, hasSeenOnboarding, checkInitialRoute]);

  useEffect(() => {
    if (hasSeenOnboarding === null) return;
    if (authLoading) return;

    // Avoid redirect loops
    const isRootRoute = pathname === '/' || pathname === '';
    const isOnboardingRoute = pathname === '/onboarding';
    const isAuthRoute = pathname.startsWith('/auth');
    const isTabsRoute = pathname.startsWith('/(tabs)');

    if (!hasSeenOnboarding) {
      if (!isOnboardingRoute) router.replace('/onboarding');
      return;
    }

    // Onboarding completed
    if (user || isDemoMode) {
      // Allow navigation to app screens (e.g. /tasks, /tree, /settings).
      // Only force users away from onboarding/auth/root back into the main tabs.
      if (isRootRoute || isOnboardingRoute || isAuthRoute) {
        if (!isTabsRoute) router.replace('/(tabs)');
      }
      return;
    }

    // No user yet
    if (!isAuthRoute) router.replace('/auth/login');
  }, [hasSeenOnboarding, authLoading, user, isDemoMode, pathname]);

  const setupNotifications = async () => {
    const hasPermission = await notificationService.requestPermissions();
    if (hasPermission) {
      await notificationService.scheduleDailyReminder();
    }
  };

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 Ви офлайн",
        "Ви можете продовжувати користуватися додатком! Ваші зміни будуть збережені локально та синхронізовані, коли ви повернетесь онлайн."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(0, 122, 255)",
      background: "rgb(242, 242, 247)",
      card: "rgb(255, 255, 255)",
      text: "rgb(0, 0, 0)",
      border: "rgb(216, 216, 220)",
      notification: "rgb(255, 59, 48)",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(10, 132, 255)",
      background: "rgb(1, 1, 1)",
      card: "rgb(28, 28, 30)",
      text: "rgb(255, 255, 255)",
      border: "rgb(44, 44, 46)",
      notification: "rgb(255, 69, 58)",
    },
  };

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="tasks" />
          <Stack.Screen name="camera" />
          <Stack.Screen name="reward" />
          <Stack.Screen name="tree" />
          <Stack.Screen name="statistics" />
          <Stack.Screen name="settings" />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Standard Modal",
            }}
          />
          <Stack.Screen
            name="formsheet"
            options={{
              presentation: "formSheet",
              title: "Form Sheet Modal",
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.5, 0.8, 1.0],
              sheetCornerRadius: 20,
            }}
          />
          <Stack.Screen
            name="transparent-modal"
            options={{
              presentation: "transparentModal",
              headerShown: false,
            }}
          />
        </Stack>
        <SystemBars style={"auto"} />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="auto" animated />
      <SettingsProvider>
        <AuthProvider>
          <WidgetProvider>
            <RootLayoutContent />
          </WidgetProvider>
        </AuthProvider>
      </SettingsProvider>
    </>
  );
}
