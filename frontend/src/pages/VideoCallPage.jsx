import { useCallStore } from '../store/callStore'
import IncomingCallDialog from '../components/call/InComingCallDialog'
import VideoCall from '../components/call/VideoCall'

const VideoCallPage = () => {
  const { callState } = useCallStore()

  const { isCalling, isReceivingCall, inCall } = callState

  if (!isCalling && !isReceivingCall && !inCall) {
    return null // Không có cuộc gọi nào đang diễn ra
  }

  // --- TRẠNG THÁI GỌI ĐI/GỌI ĐẾN (Trước khi kết nối) ---
  if (isCalling || isReceivingCall) {
    return <IncomingCallDialog />
  }

  // --- TRẠNG THÁI ĐANG TRONG CUỘC GỌI (inCall) ---
  if (inCall) {
    return <VideoCall />
  }
}

export default VideoCallPage
