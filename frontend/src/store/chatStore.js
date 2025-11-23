import { create } from 'zustand'
import axiosInstance from '../lib/axios'
import toast from 'react-hot-toast'

export const useChatStore = create((set, get) => ({
  messages: [],
  selectedUser: null,
  isLoadingMessages: false,
  isSendingMessage: false,

  // Chọn user để chat
  setSelectedUser: (user) => {
    set({ selectedUser: user })
    if (user) {
      get().getMessages(user.userid)
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
  sendMessage: async (content, image = null) => {
    const { selectedUser, messages } = get()
    if (!selectedUser) return

    // Tạo tin nhắn tạm thời (Optimistic UI)
    const tempMessage = {
      messageid: `temp-${Date.now()}`,
      senderid: 'me', // Sẽ được thay thế bằng userid thật
      receiverid: selectedUser.userid,
      content,
      image,
      created: new Date().toISOString(),
      isTemp: true, // Đánh dấu là tin nhắn tạm
    }

    // Thêm tin nhắn vào UI ngay lập tức
    set({ messages: [...messages, tempMessage], isSendingMessage: true })

    try {
      const response = await axiosInstance.post(
        `/message/send/${selectedUser.userid}`,
        { content, image }
      )

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

  // Thêm tin nhắn mới từ socket (realtime)
  addMessage: (message) => {
    const { selectedUser, messages } = get()
    
    // Chỉ thêm nếu tin nhắn liên quan đến cuộc trò chuyện hiện tại
    if (
      selectedUser &&
      (message.senderid === selectedUser.userid ||
        message.receiverid === selectedUser.userid)
    ) {
      set({ messages: [...messages, message] })
    }
  },

  // Clear messages khi đóng chat
  clearMessages: () => set({ messages: [], selectedUser: null }),
}))