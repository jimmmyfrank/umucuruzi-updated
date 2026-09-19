// utils/notifications.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { notificationService } from '../services/notification';

// ─── 1. FOREGROUND HANDLER ────────────────────────────────────────
// Without this, notifications do NOT display while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,   // iOS 15+ banner
    shouldShowList: true,     // iOS 15+ notification list
  }),
});

// ─── 2. ANDROID CHANNEL (required for heads-up popups) ────────────
export async function setupAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0D6EFD',
    sound: 'default',
    showBadge: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
  });
}

// ─── 3. REGISTER FOR PUSH + SAVE TOKEN ────────────────────────────
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.warn('[push] Must use a physical device');
    return null;
  }

  await setupAndroidChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('[push] Permission denied');
    return null;
  }

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.error('[push] No EAS projectId in app.json');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    // Save to backend — silently fail if user not logged in yet
    try {
      await notificationService.savePushToken(token);
    } catch (e) {
      console.warn('[push] Could not save token (not logged in?):', e.message);
    }

    return token;
  } catch (err) {
    console.error('[push] getExpoPushTokenAsync error:', err.message);
    return null;
  }
}

// ─── 4. LISTENERS ────────────────────────────────────────────────
export function addNotificationListeners({ onReceived, onTapped } = {}) {
  const receivedSub = Notifications.addNotificationReceivedListener((n) => {
    onReceived?.(n);
  });
  const responseSub = Notifications.addNotificationResponseReceivedListener((r) => {
    onTapped?.(r);
  });
  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}