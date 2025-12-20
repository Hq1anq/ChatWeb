import { create } from 'zustand'
import { useAuthStore } from './authStore'
import toast from 'react-hot-toast'

// Cấu hình WebRTC (sử dụng Google STUN server miễn phí)
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
}

export const useCallStore = create((set, get) => ({
  // State quản lý cuộc gọi
  callState: {
    isCalling: false, // Là người gọi (đang chờ)
    isReceivingCall: false, // Là người nhận (đang rung chuông)
    inCall: false, // Đã kết nối thành công
    remoteUser: null, // Đối tượng User của người bên kia
    callId: null, // ID duy nhất cho cuộc gọi
  },

  // Stream Media
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  receivedOffer: null, // Tạm lưu offer khi nhận call-received
  iceCandidatesQueue: [], // Hàng đợi ICE khi chưa setRemoteDescription

  // Controls
  isCameraOn: true,
  isMicrophoneOn: true,

  // =========================================================
  // WEBRTC & MEDIA STREAM FUNCTIONS
  // =========================================================

  /** Khởi tạo Local Stream (Camera & Micro) */
  initLocalStream: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true, // Đảm bảo audio bật
      })
      set({ localStream: stream, isCameraOn: true, isMicrophoneOn: true })
      return stream
    } catch (error) {
      toast.error('Không thể truy cập Camera/Micro.')
      throw error
    }
  },

  /** Dừng và hủy Local Stream */
  destroyLocalStream: () => {
    const { localStream } = get()
    if (localStream) localStream.getTracks().forEach((track) => track.stop())
    set({
      localStream: null,
      remoteStream: null,
    })
  },

  /** Khởi tạo Peer Connection */
  createPeerConnection: async (localStream) => {
    const pc = new RTCPeerConnection(configuration)
    const remoteStream = new MediaStream()
    set({ remoteStream, peerConnection: pc })

    // Add tracks từ local stream vào PC
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream)
    })

    // Lắng nghe track từ đối phương
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track)
      })
    }

    // Gửi ICE Candidates ngay khi tìm thấy
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const socket = useAuthStore.getState().socket
        const { callState } = get()
        socket.emit('webrtc-signal', {
          type: 'ice-candidate',
          targetUserId: callState.remoteUser.userid,
          candidate: event.candidate,
          callId: callState.callId,
        })
      }
    }
    return pc
  },

  /** Gửi Answer WebRTC */
  sendCallAnswer: async (pc, offer, targetUserId) => {
    const socket = useAuthStore.getState().socket
    const { callState } = get()

    await pc.setRemoteDescription(new RTCSessionDescription(offer))
    const sdpAnswer = await pc.createAnswer()
    await pc.setLocalDescription(sdpAnswer)

    socket.emit('webrtc-signal', {
      type: 'call-answer',
      targetUserId: targetUserId,
      answer: pc.localDescription,
      callId: callState.callId,
    })
  },

  // =========================================================
  // II. CALL FLOW FUNCTIONS
  // =========================================================

  /** Bắt đầu cuộc gọi (Người gọi) */
  startCall: async (remoteUser) => {
    try {
      const localStream = await get().initLocalStream()
      const pc = await get().createPeerConnection(localStream)
      const socket = useAuthStore.getState().socket
      const callId = `call-${Date.now()}`

      set({
        callState: {
          isCalling: true,
          isReceivingCall: false,
          inCall: false,
          remoteUser,
          callId,
        },
      })

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      socket.emit('call-offer', {
        targetUserId: remoteUser.userid,
        offer: offer,
        sender: useAuthStore.getState().user,
        callId: callId,
      })
    } catch (err) {
      get().endCall()
    }
  },

  /** Nhận cuộc gọi (Người nhận) */
  receiveCall: (data) => {
    set({
      callState: {
        isCalling: false,
        isReceivingCall: true,
        inCall: false,
        remoteUser: data.sender,
        callId: data.callId,
      },
      receivedOffer: data.offer, // Lưu offer nhận được
    })
  },

  /** Chấp nhận cuộc gọi (Người nhận) */
  handleAcceptLogic: async () => {
    const { receivedOffer, callState } = get()
    try {
      const localStream = await get().initLocalStream()
      const pc = await get().createPeerConnection(localStream)
      const socket = useAuthStore.getState().socket

      // Báo cho người gọi là đã bấm chấp nhận
      socket.emit('call-accepted', {
        targetUserId: callState.remoteUser.userid,
        callId: callState.callId,
      })

      // Quan trọng: Thiết lập Remote Description từ Offer nhận được trước
      await pc.setRemoteDescription(new RTCSessionDescription(receivedOffer))

      // Sau đó tạo Answer
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      socket.emit('webrtc-signal', {
        type: 'call-answer',
        targetUserId: callState.remoteUser.userid,
        answer: answer,
        callId: callState.callId,
      })

      // Xử lý hàng đợi ICE (nếu có candidate đến trước khi setRemoteDescription)
      const { iceCandidatesQueue } = get()
      iceCandidatesQueue.forEach((candidate) =>
        pc.addIceCandidate(new RTCIceCandidate(candidate))
      )

      set((state) => ({
        callState: { ...state.callState, isReceivingCall: false, inCall: true },
        iceCandidatesQueue: [],
      }))
    } catch (error) {
      get().rejectCall(true)
    }
  },

  /** Từ chối cuộc gọi */
  rejectCall: (isError = false) => {
    const { callState } = get()
    const socket = useAuthStore.getState().socket

    if (callState.remoteUser) {
      socket.emit('call-rejected', {
        targetUserId: callState.remoteUser.userid,
        callId: callState.callId,
        isError: isError,
      })
    }
    get().endCall(true) // Dọn dẹp cục bộ
    toast.error(isError ? 'Lỗi kết nối.' : `Đã từ chối cuộc gọi.`)
  },

  /** Kết thúc cuộc gọi */
  endCall: (isRemote = false) => {
    const { peerConnection, destroyLocalStream, callState } = get()
    const socket = useAuthStore.getState().socket

    // Gửi tín hiệu kết thúc nếu là local và đang trong cuộc gọi
    if (
      !isRemote &&
      (callState.inCall || callState.isCalling) &&
      callState.remoteUser
    ) {
      socket.emit('call-ended', {
        targetUserId: callState.remoteUser.userid,
        callId: callState.callId,
      })
    }

    if (peerConnection) peerConnection.close()
    destroyLocalStream()

    set({
      callState: {
        isCalling: false,
        isReceivingCall: false,
        inCall: false,
        remoteUser: null,
        callId: null,
      },
      peerConnection: null,
      remoteStream: null,
      receivedOffer: null,
    })

    if (!isRemote) toast.success('Cuộc gọi đã kết thúc.')
  },

  // =========================================================
  // III. SOCKET EVENT LISTENERS
  // =========================================================

  subscribeToCallEvents: () => {
    const socket = useAuthStore.getState().socket
    if (!socket) return

    socket.on('webrtc-signal', async (data) => {
      const { peerConnection, callState } = get()
      if (data.callId !== callState.callId) return

      if (data.type === 'call-answer') {
        // Người gọi nhận Answer và thiết lập kết nối
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        )
        set((state) => ({
          callState: { ...state.callState, isCalling: false, inCall: true },
        }))
      } else if (data.type === 'ice-candidate') {
        if (peerConnection && peerConnection.remoteDescription) {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          )
        } else {
          // Lưu vào hàng đợi nếu PC chưa sẵn sàng
          set((state) => ({
            iceCandidatesQueue: [...state.iceCandidatesQueue, data.candidate],
          }))
        }
      }
    })

    socket.on('call-received', (data) => {
      if (get().callState.inCall)
        // Không nhận cuộc gọi nếu đang trong cuộc gọi khác
        return socket.emit('call-rejected', {
          targetUserId: data.sender.userid,
          callId: data.callId,
        })
      get().receiveCall(data)
    })

    socket.on('call-ended', (data) => get().endCall(true))
    socket.on('call-rejected', (data) => get().endCall(true))
  },

  unsubscribeFromCallEvents: () => {
    const socket = useAuthStore.getState().socket
    if (socket) {
      socket.off('call-received')
      socket.off('call-answered')
      socket.off('webrtc-signal')
      socket.off('call-rejected')
      socket.off('call-ended')
    }
  },
}))
