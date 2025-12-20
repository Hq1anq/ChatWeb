import { getProfilePic } from '../../lib/utils'
import { useCallStore } from '../../store/callStore'
import { PhoneCall, PhoneMissed } from 'lucide-react'

const IncomingCallDialog = () => {
  const { callState, endCall, rejectCall, handleAcceptLogic } = useCallStore()

  const { isCalling, isReceivingCall, remoteUser } = callState

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="text-center text-white space-y-6">
        <div className="avatar placeholder ring-4 ring-primary ring-offset-base-100 ring-offset-2 rounded-full">
          <div className="w-32 h-32 rounded-full overflow-hidden">
            <img
              src={getProfilePic(remoteUser)}
              alt="Remote User"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold">{remoteUser?.fullname}</h1>
        <p className="text-xl text-white/80">
          {isReceivingCall ? 'Đang gọi cho bạn...' : 'Đang kết nối...'}
        </p>
        <div className="mt-8">
          {isReceivingCall ? (
            <div className="flex justify-center gap-10">
              <button
                className="btn btn-circle btn-lg btn-success text-white"
                onClick={handleAcceptLogic} // Chấp nhận
                title="Chấp nhận"
              >
                <PhoneCall size={30} />
              </button>
              <button
                className="btn btn-circle btn-lg btn-error text-white"
                onClick={() => rejectCall(false)} // Từ chối
                title="Từ chối"
              >
                <PhoneMissed size={30} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-circle btn-lg btn-error text-white"
              onClick={() => endCall(false)}
              title="Hủy cuộc gọi"
            >
              <PhoneMissed size={30} />
            </button>
          )}
        </div>
        {isCalling && !isReceivingCall && (
          <p className="mt-4 text-sm text-white/50 animate-pulse">
            Đang chờ phản hồi...
          </p>
        )}
      </div>
    </div>
  )
}
export default IncomingCallDialog
