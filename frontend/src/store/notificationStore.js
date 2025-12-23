import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast'; // <--- 1. Import toast ở đầu file thay vì require

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get('/notifications');
      set({ 
        notifications: res.data,
        unreadCount: res.data.filter(n => !n.is_read).length
      });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      set(state => {
        const updated = state.notifications.map(n => 
           n.notif_id === id ? { ...n, is_read: true } : n
        );
        return {
           notifications: updated,
           unreadCount: updated.filter(n => !n.is_read).length
        };
      });
    } catch (error) {
      console.error(error);
    }
  },

  // Lắng nghe socket
  subscribeToNotifications: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on('new-notification', (newNotif) => {
      console.log("NHẬN ĐƯỢC THÔNG BÁO TỪ SOCKET:", newNotif); 
      
      set(state => ({
        notifications: [newNotif, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }));
      
      // <--- 2. Sử dụng toast trực tiếp (đã import ở trên)
      toast('🔔 ' + newNotif.content); 
    });
  },

  unsubscribeFromNotifications: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off('new-notification');
  },

  reset: () => {
    set({ notifications: [], unreadCount: 0 });
    
    // <--- 3. SỬA LỖI Ở ĐÂY: Dùng useAuthStore trực tiếp (đã import ở đầu file)
    const socket = useAuthStore.getState().socket; 
    
    if (socket) socket.off('new-notification');
  }
}));