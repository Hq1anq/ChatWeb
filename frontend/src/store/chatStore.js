import { create } from 'zustand'
import axiosInstance from '../lib/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from './authStore'
import { getFileName } from '../lib/utils'

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  groupMembers: [],
  selectedUser: null,
  isUsersLoading: false,
  isGroupsLoading: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  isCreatingGroup: false,

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),

  setSelectedUser: (userOrGroup) => {
    set({ selectedUser: userOrGroup, groupMembers: [] }); 

    if (userOrGroup) {
      const isGroup = userOrGroup.groupid !== undefined
      const id = isGroup ? userOrGroup.groupid : userOrGroup.userid
      
      get().getMessages(id, isGroup)

      // Đánh dấu tin nhắn đã xem khi mở cuộc trò chuyện
      get().markMessagesAsSeen(id, isGroup)

      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        set({ isSidebarOpen: false })
      }
    }
  },

  // Đánh dấu tin nhắn đã xem
  markMessagesAsSeen: (conversationUserId, isGroup = false) => {
    const socket = useAuthStore.getState().socket
    if (!socket || !conversationUserId) return

    // Emit socket event để đánh dấu đã xem
    socket.emit('markAsSeen', {
      conversationUserId,
      isGroup
    })
  },

  // Cập nhật trạng thái seen cho messages
  updateMessagesSeen: (data) => {
    // eslint-disable-next-line no-unused-vars
    const { viewerId, senderId, messageIds, isGroup, seenAt } = data
    const currentUser = useAuthStore.getState().user

    // Chỉ cập nhật nếu mình là người gửi
    if (currentUser?.userid === senderId) return

    set((state) => ({
      messages: state.messages.map((msg) => {
        // Nếu có danh sách messageIds cụ thể
        if (messageIds && messageIds.includes(msg.messageid)) {
          return { ...msg, seen: true, seenAt }
        }
        // Nếu không có danh sách, cập nhật tất cả tin nhắn của mình gửi cho người đó
        if (!messageIds && msg.senderid === currentUser?.userid && !msg.seen) {
          return { ...msg, seen: true, seenAt }
        }
        return msg
      })
    }))
  },

  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const response = await axiosInstance.get('/message/users')
      const usersData = Array.isArray(response.data) ? response.data : (response.data.users || []);
      set({ users: usersData })
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách')
      set({ users: [] })
    } finally {
      set({ isUsersLoading: false })
    }
  },

  getGroups: async () => {
    set({ isGroupsLoading: true })
    try {
      const response = await axiosInstance.get('/groups')
      set({ groups: response.data })
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      set({ isGroupsLoading: false })
    }
  },

  createGroup: async (groupData) => {
    set({ isCreatingGroup: true })
    try {
      const response = await axiosInstance.post('/groups/create', groupData)
      set((state) => ({ groups: [response.data.group, ...state.groups] }))
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tạo nhóm thất bại')
      return false
    } finally {
      set({ isCreatingGroup: false })
    }
  },

  getGroupMembers: async (groupId) => {
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/members`)
      set({ groupMembers: res.data.members })
    } catch (error) {
      console.error(error)
    }
  },

  getMessages: async (id, isGroup = false) => {
    set({ isLoadingMessages: true })
    try {
      const response = await axiosInstance.get(`/message/${id}?isGroup=${isGroup}`)
      set({ messages: response.data })
    } catch (error) {
      console.error('Lỗi khi tải tin nhắn:', error)
      toast.error('Không thể tải tin nhắn')
    } finally {
      set({ isLoadingMessages: false })
    }
  },

  sendMessage: async (message, fileAttachment, replyToId = null) => {
    const { selectedUser, messages, groupMembers } = get() 
    
    if (!selectedUser) return
    const currentUser = useAuthStore.getState().user;
    const isGroup = selectedUser.groupid !== undefined
    const receiverId = isGroup ? selectedUser.groupid : selectedUser.userid

    const tempMessage = {
      messageid: `temp-${Date.now()}`,
      senderid: currentUser.userid,
      receiverid: isGroup ? null : receiverId,
      group_id: isGroup ? receiverId : null,
      content: message,
      file: fileAttachment ? fileAttachment.file.name : null,
      created: new Date().toISOString(),
      isTemp: true,
      seen: false,
      replyToId,
      sender: useAuthStore.getState().user 
    }

    set({ messages: [...messages, tempMessage], isSendingMessage: true })

    const mentionMatches = (typeof message === 'string') ? message.match(/@([\p{L}\p{N}_ ]+)/gu) : null;
    let mentionedIds = [];
    
    if (mentionMatches && groupMembers && groupMembers.length > 0) {
        mentionMatches.forEach(match => {
            const name = match.substring(1).trim();
            const user = groupMembers.find(m => (m.nickname || m.fullname) === name);
            if (user) mentionedIds.push(user.userid);
        });
    }

    try {
      const formData = new FormData()
      if (message.trim()) formData.append('content', message)
      if (fileAttachment) formData.append('file', fileAttachment.file)
      if (replyToId) formData.append('replyToId', replyToId)
      
      formData.append('isGroup', isGroup)

      if (mentionedIds.length > 0) {
          formData.append('mentions', JSON.stringify(mentionedIds));
      }

      const response = await axiosInstance.post(
        `/message/send/${receiverId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      get().updateSidebarList(response.data, isGroup)

      set((state) => ({
        messages: state.messages
          .filter((msg) => msg.messageid !== tempMessage.messageid)
          .concat({ ...response.data, seen: false }),
      }))

      return { success: true }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error)
      toast.error('Không thể gửi tin nhắn')
      set((state) => ({
        messages: state.messages.filter((msg) => msg.messageid !== tempMessage.messageid),
      }))
      return { success: false, error: error.response?.data?.message }
    } finally {
      set({ isSendingMessage: false })
    }
  },

  updateSidebarList: (newMessage, isGroup) => {
     set((state) => {
        const targetId = isGroup ? newMessage.group_id : (
            newMessage.senderid === useAuthStore.getState().user.userid ? newMessage.receiverid : newMessage.senderid
        );

        const listKey = isGroup ? 'groups' : 'users';
        const idKey = isGroup ? 'groupid' : 'userid';
        
        let updatedList = [...state[listKey]];
        let targetIndex = updatedList.findIndex(item => item[idKey] === targetId);
        
        const latestMessageContent = newMessage.content || (newMessage.file ? getFileName(newMessage.file) : 'File đính kèm');

        if (targetIndex !== -1) {
            const updatedItem = {
                ...updatedList[targetIndex],
                latestMessage: latestMessageContent,
                latestTime: newMessage.created,
                latestSenderId: newMessage.senderid,
                latestSenderName: newMessage.sender?.fullname || "Bạn" 
            };
            updatedList.splice(targetIndex, 1);
            updatedList.unshift(updatedItem);
        }
        return { [listKey]: updatedList };
     })
  },

  onMessage: () => {
    const { selectedUser, updateSidebarList, markMessagesAsSeen, updateMessagesSeen } = get()
    const socket = useAuthStore.getState().socket
    if(!socket) return;

    socket.on('newMessage', (newMessage) => {
      const isGroupMsg = newMessage.group_id !== null;
      updateSidebarList(newMessage, isGroupMsg);

      const currentSelectedId = selectedUser ? (selectedUser.groupid || selectedUser.userid) : null;
      const isBelongToCurrentChat = isGroupMsg 
          ? newMessage.group_id === currentSelectedId 
          : (newMessage.senderid === currentSelectedId || newMessage.senderid === useAuthStore.getState().user.userid);

      if (isBelongToCurrentChat) {
        set({ messages: [...get().messages, newMessage] })
        
        // Nếu đang xem cuộc trò chuyện này, đánh dấu đã xem
        const currentUser = useAuthStore.getState().user
        if (newMessage.senderid !== currentUser?.userid) {
          const conversationId = isGroupMsg ? newMessage.group_id : newMessage.senderid
          markMessagesAsSeen(conversationId, isGroupMsg)
        }
      }
    });

    // Lắng nghe event messagesSeen
    socket.on('messagesSeen', (data) => {
      updateMessagesSeen(data)
    });

    socket.on('new-group', (newGroup) => {
        set(state => ({
            groups: [newGroup, ...state.groups]
        }));
        socket.emit("join-group", newGroup.groupid);
        toast.success(`Bạn vừa được thêm vào nhóm: ${newGroup.name}`);
    });
  },

  updateNickname: async (groupId, userId, nickname) => {
      try {
          await axiosInstance.put(`/groups/${groupId}/nickname`, { userId, nickname });
          set(state => ({
              groupMembers: state.groupMembers.map(member => 
                  member.userid === userId ? { ...member, nickname } : member
              )
          }));
          toast.success("Đổi biệt danh thành công");
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
          toast.error("Lỗi đổi biệt danh");
      }
  },

  offMessage: () => {
    const socket = useAuthStore.getState().socket
    if(socket) {
      socket.off('newMessage')
      socket.off('messagesSeen')
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket
    if(socket) {
        socket.off('newMessage');
        socket.off('new-group');
        socket.off('messagesSeen');
    }
  },
  
  clearMessages: () => set({ messages: [], selectedUser: null, groupMembers: [] }),
}))