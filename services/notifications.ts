
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Request permissions
  async requestPermissions() {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return false;
    }

    console.log('Push notification permissions granted');
    return true;
  },

  // Get push token
  async getPushToken() {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      console.log('Expo push token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  // Schedule daily reminder
  async scheduleDailyReminder() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'TreeBuddy 🌳',
          body: 'Не забудь виконати екозавдання!',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 10,
          minute: 0,
          repeats: true,
        },
      });
      
      console.log('Daily reminder scheduled');
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  },

  // Send local notification
  async sendLocalNotification(title: string, body: string) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null,
      });
      console.log('Local notification sent');
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  },

  // Notify tree level up
  async notifyTreeLevelUp(level: number) {
    await this.sendLocalNotification(
      'Вітаємо! 🎉',
      `Ваше дерево виросло до рівня ${level}!`
    );
  },

  // Notify new task
  async notifyNewTask(taskTitle: string) {
    await this.sendLocalNotification(
      'Нове завдання! 📋',
      `Доступне нове завдання: ${taskTitle}`
    );
  },
};
