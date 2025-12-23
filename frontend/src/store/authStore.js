import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axiosInstance from '../lib/axios'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'
import { useCallStore } from './callStore'
import { useChatStore } from './chatStore'

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
        set({ isUpdatingProfile: true }) // Bắt đầu loading
        try {
          const response = await axiosInstance.put(
            '/auth/update-profile/pic',
            data,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          )

          console.log('SERVER TRẢ VỀ:', response.data) // <--- KIỂM TRA LOG NÀY

          set((state) => {
            // Logic bảo vệ Bio:
            // Ưu tiên Bio từ Server trả về.
            // Nếu Server không trả về (undefined), lấy Bio cũ của User.
            // Nếu Bio cũ không có, lấy chuỗi rỗng.
            const incomingBio = response.data.bio
            const currentBio = state.user.bio

            const finalBio =
              incomingBio !== undefined && incomingBio !== null
                ? incomingBio
                : currentBio || ''

            const newUserState = {
              ...state.user, // Giữ lại data cũ
              ...response.data, // Ghi đè data mới
              bio: finalBio, // Đảm bảo Bio luôn đúng
            }

            console.log('USER MỚI SẼ LƯU:', newUserState) // <--- KIỂM TRA LOG NÀY
            return { user: newUserState }
          })

          toast.success('Cập nhật ảnh thành công!')
          return { success: true }
        } catch (error) {
          console.error('Lỗi update pic:', error)
          toast.error(error.response?.data?.message || 'Lỗi cập nhật')
          return { success: false }
        } finally {
          // Đảm bảo luôn tắt loading để nút bấm được trở lại
          set({ isUpdatingProfile: false })
        }
      },
      updateProfileBio: async (data) => {
        set({ isUpdatingProfile: true })
        try {
          // Gọi API mới tạo
          const res = await axiosInstance.put('/auth/update-profile/bio', {
            bio: data.bio,
          })

          // Cập nhật lại user trong store (giữ nguyên ảnh cũ, chỉ thay bio mới)
          set({ user: res.data })
          toast.success('Cập nhật giới thiệu thành công!')
          return { success: true }
        } catch (error) {
          const msg = error.response?.data?.message || 'Lỗi cập nhật Bio'
          toast.error(msg)
          return { success: false, error: msg }
        } finally {
          set({ isUpdatingProfile: false })
        }
      },
      updatePassword: async (data) => {
        set({ isUpdatingProfile: true })
        try {
          await axiosInstance.put('/auth/update-password', data)
          toast.success('Đổi mật khẩu thành công!')
          return { success: true }
        } catch (error) {
          const msg = error.response?.data?.message || 'Đổi mật khẩu thất bại'
          toast.error(msg)
          return { success: false, error: msg }
        } finally {
          set({ isUpdatingProfile: false })
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

        socket.on("connect", () => {
          console.log("Socket connected với ID:", socket.id);
          
          useChatStore.getState().unsubscribeFromMessages()
          useChatStore.getState().onMessage(); 
          useCallStore.getState().subscribeToCallEvents();
        });

        set({ socket: socket })

        socket.on('online-users', (userIds) => {
          set({ onlineUsers: userIds })
        })

        // --- THÊM: Đăng ký Call Events ---
        useCallStore.getState().subscribeToCallEvents()
        // ---------------------------------
      },
      disconnectSocket: () => {
        if (get().socket?.connected) {
          // --- THÊM: Hủy đăng ký Call Events ---
          useCallStore.getState().unsubscribeFromCallEvents()
          // -------------------------------------
          get().socket.disconnect()
        }
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
