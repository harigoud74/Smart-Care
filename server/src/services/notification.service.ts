import { db } from '../db/store.js';
import { Notification, NotificationType } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  link?: string
): Notification {
  const notif: Notification = {
    id: `notif-${uuidv4()}`,
    userId,
    title,
    message,
    type,
    isRead: false,
    link,
    createdAt: new Date().toISOString(),
  };

  db.createNotification(notif);

  // Simulated Email notification output
  const user = db.findUserById(userId);
  if (user) {
    console.log(
      `[EMAIL NOTIFICATION DISPATCHED] To: ${user.email} | Subject: ${title} | Body: ${message}`
    );
  }

  return notif;
}
