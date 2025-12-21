import {
  LogOut,
  Mic,
  MicOff,
  Video,
  VideoOff,
  LayoutTemplate,
  Square,
} from 'lucide-react'
import { useCallStore } from '../../store/callStore'
import VideoContainer from './VideoContainer.jsx'
import { useEffect, useState } from 'react'

const VideoCall = () => {
  const { localStream, remoteStream, endCall, remoteStatus, toggleMedia } =
    useCallStore()

  const [isCamOn, setCamOn] = useState(true)
  const [isMicOn, setMicOn] = useState(true)
  const [layoutMode, setLayoutMode] = useState('pip') // 'pip' hoặc 'split'

  useEffect(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) setCamOn(videoTrack.enabled)
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) setMicOn(audioTrack.enabled)
    }
  }, [localStream])

  /** Bật/Tắt Camera */
  const toggleCam = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      const nextState = !videoTrack.enabled
      if (videoTrack) videoTrack.enabled = nextState
      setCamOn(nextState)
      toggleMedia('video', nextState)
    }
  }

  /** Bật/Tắt Microphone */
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      const nextState = !audioTrack.enabled
      if (audioTrack) audioTrack.enabled = nextState
      setMicOn(nextState)
      toggleMedia('audio', nextState)
    }
  }

  return (
    <div className="fixed inset-0 z-100 bg-black flex flex-col">
      <div
        className={`w-full h-full flex-1 relative flex ${
          layoutMode === 'split' ? 'flex-col md:flex-row' : ''
        }`}
      >
        <VideoContainer
          stream={remoteStream}
          isLocal={false}
          isCameraOn={remoteStatus.isCameraOn}
          isMicrophoneOn={remoteStatus.isMicrophoneOn}
          layoutMode={layoutMode}
        />

        <VideoContainer
          stream={localStream}
          isLocal={true}
          isCameraOn={isCamOn}
          isMicrophoneOn={isMicOn}
          layoutMode={layoutMode}
        />
      </div>

      {/* Controls - Dạng Floating đè lên video */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-gray-900/60 backdrop-blur-md rounded-full border border-white/10 z-30">
        {/* Toggle Camera */}
        <button
          className={`btn btn-circle btn-md md:btn-lg border-none ${
            isCamOn
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          onClick={toggleCam}
        >
          {isCamOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

        {/* Toggle Microphone */}
        <button
          className={`btn btn-circle btn-md md:btn-lg border-none ${
            isMicOn
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          onClick={toggleMic}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        {/* Nút chuyển đổi Layout */}
        <button
          className="btn btn-circle bg-gray-700 border-none text-white"
          onClick={() => setLayoutMode(layoutMode === 'pip' ? 'split' : 'pip')}
          title="Đổi giao diện"
        >
          {layoutMode === 'pip' ? (
            <LayoutTemplate size={20} />
          ) : (
            <Square size={20} />
          )}
        </button>

        {/* End Call */}
        <button
          className="btn btn-circle btn-md md:btn-lg bg-red-500 hover:bg-red-600 text-white border-none"
          onClick={() => endCall(false)}
        >
          <LogOut size={24} />
        </button>
      </div>
    </div>
  )
}

export default VideoCall
