// utils/sendPushNotification.js
const { Expo } = require('expo-server-sdk');
const { User } = require('../models');

const expo = new Expo();

/**
 * Send a push notification to a single user.
 * Signature: sendPushNotification(userId, title, message, data)
 */
const sendPushNotification = async (userId, title, message, data = {}) => {
  try {
    const user = await User.findByPk(userId);
    if (!user || !user.push_token) return;

    if (!Expo.isExpoPushToken(user.push_token)) {
      console.error(`Invalid Expo push token: ${user.push_token}`);
      return;
    }

    const messages = [
      {
        to: user.push_token,
        sound: 'default',
        title: title || 'Umucuruzi',
        body: message || '',
        data: data || {},
        priority: 'high',       // ← Android heads-up
        channelId: 'default',   // ← must match the channel name in the app
        badge: 1,
        android: {
          priority: 'high',
          channelId: 'default',
          sound: 'default',
          visibility: 'public',
          color: '#0D6EFD',
        },
        ios: {
          sound: true,
          badge: 1,
        },
      },
    ];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        // Optionally log errors
        ticketChunk.forEach((t) => {
          if (t.status === 'error') {
            console.error('[push] ticket error:', t.message, t.details);
          }
        });
      } catch (error) {
        console.error('[push] send error:', error.message);
      }
    }
    return tickets;
  } catch (err) {
    console.error('Error sending push notification:', err);
  }
};

module.exports = { sendPushNotification };