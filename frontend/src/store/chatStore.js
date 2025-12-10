import { create } from 'zustand'
import axiosInstance from '../lib/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from './authStore'
import { getFileName } from '../lib/utils'

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isLoadingMessages: false,
  isSendingMessage: false,

  // ========== MỚI: State cho Sidebar Responsive ==========
  isSidebarOpen: true,

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  closeSidebar: () => set({ isSidebarOpen: false }),

  openSidebar: () => set({ isSidebarOpen: true }),

  // Chọn user để chat (đã cập nhật để đóng sidebar trên mobile)
  setSelectedUser: (user) => {
    set({ selectedUser: user })
    if (user) {
      get().getMessages(user.userid)
      // Tự đóng sidebar trên mobile khi chọn user
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        set({ isSidebarOpen: false })
      }
    }
  },

  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const response = await axiosInstance.get('/message/users')
      set({ users: response.data })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách')
    } finally {
      set({ isUsersLoading: false })
    }
  },

  // Lấy tin nhắn với user được chọn
  getMessages: async (userId) => {
    set({ isLoadingMessages: true })
    try {
      const response = await axiosInstance.get(`/message/${userId}`)
      set({ messages: response.data })
    } catch (error) {
      console.error('Lỗi khi tải tin nhắn:', error)
      toast.error('Không thể tải tin nhắn')
    } finally {
      set({ isLoadingMessages: false })
    }
  },

  // Gửi tin nhắn với Optimistic UI
  sendMessage: async (message, fileAttachment) => {
    console.log('message: ', message)
    console.log('file: ', fileAttachment)
    const { selectedUser, messages } = get()
    if (!selectedUser) return

    // Tạo tin nhắn tạm thời (Optimistic UI)
    const tempMessage = {
      messageid: `temp-${Date.now()}`,
      senderid: 'me',
      receiverid: selectedUser.userid,
      content: message,
      file: fileAttachment ? fileAttachment.file.name : null,
      created: new Date().toISOString(),
      isTemp: true,
    }

    // Thêm tin nhắn vào UI ngay lập tức
    set({ messages: [...messages, tempMessage], isSendingMessage: true })

    try {
      const formData = new FormData()

      if (message.trim()) {
        formData.append('content', message)
      }

      if (fileAttachment) {
        formData.append('file', fileAttachment.file)
      }

      const response = await axiosInstance.post(
        `/message/send/${selectedUser.userid}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      get().updateSidebarUser(response.data)

      // Thay thế tin nhắn tạm bằng tin nhắn thật từ server (FIX BUG)
      set((state) => ({
        messages: state.messages
          .filter((msg) => msg.messageid !== tempMessage.messageid)
          .concat(response.data),
      }))

      return { success: true }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error)
      toast.error('Không thể gửi tin nhắn')

      // Xóa tin nhắn tạm nếu gửi thất bại (FIX BUG)
      set((state) => ({
        messages: state.messages.filter(
          (msg) => msg.messageid !== tempMessage.messageid
        ),
      }))

      return { success: false, error: error.response?.data?.message }
    } finally {
      set({ isSendingMessage: false })
    }
  },

  // Cập nhật sidebar list (users array)
  updateSidebarUser: (message) => {
    set((state) => {
      const { user } = useAuthStore.getState()
      const targetUserId =
        message.senderid === user.userid ? message.receiverid : message.senderid
      const latestMessageContent =
        message.content || (message.file ? getFileName(message.file) : '')

      let updatedUsers = [...state.users]
      let targetUserIndex = -1

      const targetUser = updatedUsers.find((u, index) => {
        if (u.userid === targetUserId) {
          targetUserIndex = index
          return true
        }
        return false
      })

      if (targetUser) {
        const updatedTargetUser = {
          ...targetUser,
          latestMessage: latestMessageContent,
          latestTime: message.created,
        }

        updatedUsers.splice(targetUserIndex, 1)
        updatedUsers.unshift(updatedTargetUser)
      }

      return { users: updatedUsers }
    })
  },

  // Thêm tin nhắn mới từ socket (realtime)
  onMessage: () => {
    const { selectedUser, updateSidebarUser } = get()

    if (!selectedUser) return

    const socket = useAuthStore.getState().socket

    socket.on('newMessage', (newMessage) => {
      updateSidebarUser(newMessage)

      if (newMessage.senderid === selectedUser.userid)
        set({ messages: [...get().messages, newMessage] })
    })
  },

  offMessage: () => {
    const socket = useAuthStore.getState().socket
    socket.off('newMessage')
  },

  // Clear messages khi đóng chat
  clearMessages: () => set({ messages: [], selectedUser: null }),
}))