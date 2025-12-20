import { LogOut, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { useCallStore } from '../../store/callStore'
import VideoContainer from './VideoContainer.jsx'
import { useEffect, useState } from 'react'

const VideoCall = () => {
  const { localStream, remoteStream, endCall } = useCallStore()

  const [isCamOn, setCamOn] = useState(true)
  const [isMicOn, setMicOn] = useState(true)

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
      if (videoTrack) videoTrack.enabled = !videoTrack.enabled
      setCamOn(videoTrack.enabled)
    }
  }

  /** Bật/Tắt Microphone */
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) audioTrack.enabled = !audioTrack.enabled
      setMicOn(audioTrack.enabled)
    }
  }

  return (
    <div className="fixed inset-0 z-100 bg-gray-900 flex flex-col">
      {/* Video Area */}
      <VideoContainer
        stream={remoteStream}
        isLocal={false}
        isCameraOn={true}
        isMicrophoneOn={true}
      ></VideoContainer>

      <VideoContainer
        stream={localStream}
        isLocal={true}
        isCameraOn={isCamOn}
        isMicrophoneOn={isMicOn}
      ></VideoContainer>

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
