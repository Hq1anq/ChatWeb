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

  // Chọn user để chat
  setSelectedUser: (user) => {
    set({ selectedUser: user })
    if (user) {
      get().getMessages(user.userid)
    }
  },

  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const response = await axiosInstance.get('/message/users')
      set({ users: response.data })
    } catch (error) {
      toast.error(error.response.data.message)
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
      senderid: 'me', // Sẽ được thay thế bằng userid thật
      receiverid: selectedUser.userid,
      content: message,
      file: fileAttachment ? fileAttachment.file.name : null,
      created: new Date().toISOString(),
      isTemp: true, // Đánh dấu là tin nhắn tạm
    }

    // Thêm tin nhắn vào UI ngay lập tức
    set({ messages: [...messages, tempMessage], isSendingMessage: true })

    try {
      const formData = new FormData()

      if (message.trim()) {
        formData.append('content', message)
      }

      if (fileAttachment) {
        // Multer ở backend expects file với keyvalue 'image'
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

      // Thay thế tin nhắn tạm bằng tin nhắn thật từ server
      set({
        messages: messages
          .filter((msg) => msg.messageid !== tempMessage.messageid)
          .concat(response.data),
      })

      return { success: true }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error)
      toast.error('Không thể gửi tin nhắn')

      // Xóa tin nhắn tạm nếu gửi thất bại
      set({
        messages: messages.filter(
          (msg) => msg.messageid !== tempMessage.messageid
        ),
      })

      return { success: false, error: error.response?.data?.message }
    } finally {
      set({ isSendingMessage: false })
    }
  },

  // Cập nhật sidebar list (users array)
  updateSidebarUser: (message) => {
    set((state) => {
      const { user } = useAuthStore.getState() // user hiện tại
      const targetUserId =
        message.senderid === user.userid ? message.receiverid : message.senderid // người còn lại
      const latestMessageContent =
        message.content || (message.file ? getFileName(message.file) : '')

      let updatedUsers = [...state.users]
      let targetUserIndex = -1

      // Tìm user trong danh sách sidebar
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

        // xóa user khỏi vị trí hiện tại
        updatedUsers.splice(targetUserIndex, 1)

        // thêm user vào đầu danh sách (reorder)
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
      // Caapj nhaatj side bar khi có tin nhắn mới
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
