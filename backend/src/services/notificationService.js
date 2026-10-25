import { Notification } from '../models/Notification.js';
import { sendNotificationToUser } from '../sockets/socketHandler.js';

export const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = '',
}) => {
  try {
    const notif = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
    });

    const populated = await Notification.findById(notif._id).populate('sender', 'name avatar');

    // Send real-time alert via WebSocket
    sendNotificationToUser(recipient, populated);
    return populated;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error);
    return null;
  }
};
