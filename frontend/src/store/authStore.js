import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../lib/axios';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Đăng ký
      signup: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post('/auth/signup', {
            fullName: data.fullName,
            username: data.username,
            password: data.password
          });
          
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, token, isLoading: false });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Đăng nhập
      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post('/auth/login', {
            username: data.username,
            password: data.password
          });
          
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, token, isLoading: false });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Đăng xuất
      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('token');
          set({ user: null, token: null });
        }
      },

      // Kiểm tra authentication
      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ user: null, token: null });
          return false;
        }

        try {
          const response = await axiosInstance.get('/auth/me');
          set({ user: response.data, token });
          return true;
        } catch (error) {
          localStorage.removeItem('token');
          set({ user: null, token: null });
          return false;
        }
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token 
      })
    }
  )
);