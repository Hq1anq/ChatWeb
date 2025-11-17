import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axiosInstance from '../lib/axios'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isUpdatingProfile: false,
      error: null,
      socket: null,
      onlineUsers: [],

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

      updateProfilePic: async (data) => {
        set({ isUpdatingProfile: true, error: null })
        try {
          const response = await axiosInstance.put(
            '/auth/update-profile/pic',
            data,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          )
          console.log(response)
          set({ user: response.data })
          toast.success('Cập nhật hồ sơ thành công!')
          return { success: true }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || 'Cập nhật hồ sơ thất bại'
          set({ error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      connectSocket: () => {
        const { user } = get()
        if (!user || get().socket?.connected) return

        const socket = io(import.meta.env.VITE_SERVER_URL, {
          query: {
            userId: user.userid,
          },
        })
        socket.connect()

        set({ socket: socket })

        socket.on('online-users', (userIds) => {
          set({ onlineUsers: userIds })
        })
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
