import { NotificationModel } from '../model/notification.model.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userid;
    const notifications = await NotificationModel.getByUser(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationModel.markAsRead(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};