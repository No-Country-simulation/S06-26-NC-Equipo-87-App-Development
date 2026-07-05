import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { putRequest } from '../api/apiClient';

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    await putRequest('/api/users/push-token', { expoPushToken: token });
    console.log('Push token registered successfully:', token);
    return token;
  } catch (error) {
    console.error('Error registering push notifications:', error);
    return null;
  }
};

export const unregisterPushNotificationsAsync = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await putRequest('/api/users/push-token', { expoPushToken: null });
    console.log('Push token unregistered on backend');
  } catch (error) {
    console.error('Error unregistering push notifications:', error);
  }
};
