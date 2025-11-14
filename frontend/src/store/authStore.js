import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axiosInstance from '../lib/axios'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'

const BASE_URL = 'http://localhost:5000'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      socket: null,

      // Đăng ký
      signup: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axiosInstance.post('/auth/signup', {
            fullname: data.fullName,
            email: data.email,
            password: data.password,
          })

          set({ user: response.data })

          get().connectSocket()

          return { success: true }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || 'Đăng ký thất bại'
          // set({ error: errorMessage, isLoading: false });
          set({ error: errorMessage })
          return { success: false, error: errorMessage }
        } finally {
          set({ isLoading: false })
        }
      },

      // Đăng nhập
      login: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axiosInstance.post('/auth/login', {
            email: data.email,
            password: data.password,
          })

          set({ user: response.data })
          toast.success('Đăng nhập thành công!')

          get().connectSocket()

          return { success: true }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || 'Đăng nhập thất bại'
          // set({ error: errorMessage, isLoading: false });
          set({ error: errorMessage })
          return { success: false, error: errorMessage }
        } finally {
          set({ isLoading: false })
        }
      },

      // Đăng xuất
      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout')
          get().disconnectSocket()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({ user: null })
        }
      },

      // Kiểm tra authentication
      checkAuth: async () => {
        try {
          const response = await axiosInstance.get('/auth/me')
          set({ user: response.data })

          get().connectSocket()

          return true
        } catch (error) {
          // localStorage.removeItem('token')
          // set({ user: null, token: null })
          set({ user: null })
          return false
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      connectSocket: () => {
        const { user } = get()
        if (!user || get().socket?.connected) return

        const socket = io(BASE_URL)
        socket.connect()

        set({ socket: socket })
      },
      disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect()
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        // token: state.token,
      }),
    }
  )
)
