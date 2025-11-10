import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axiosInstance from '../lib/axios'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      // token: null,
      isLoading: false,
      error: null,

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

          // const { token, user } = response.data

          // localStorage.setItem('token', token)
          // set({ user, token, isLoading: false })

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

          // const { token, user } = response.data

          // localStorage.setItem('token', token)
          // set({ user, token, isLoading: false })

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
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // localStorage.removeItem('token')
          // set({ user: null, token: null })
          set({ user: null })
        }
      },

      // Kiểm tra authentication
      checkAuth: async () => {
        // const token = localStorage.getItem('token')
        // if (!token) {
        //   set({ user: null, token: null })
        //   return false
        // }

        try {
          const response = await axiosInstance.get('/auth/me')
          set({ user: response.data })
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
