import { useEffect, useRef } from 'react'
import { CameraOff, Mic, MicOff } from 'lucide-react'

export default function VideoContainer({ stream, isLocal, isMicrophoneOn }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div
      className={`absolute rounded-md ${
        isLocal ? 'right-4 bottom-4' : 'w-full h-full'
      }`}
    >
      <video
        ref={videoRef}
        className={`${
          isLocal
            ? 'right-4 bottom-4 max-w-[33.333vw] max-h-[33.333vh]'
            : 'w-full h-full'
        }`}
        autoPlay
        playsInline
        muted={isLocal}
      />

      <div className="absolute left-2 bottom-2 bg-black/60 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm">
        {isMicrophoneOn ? <Mic size={16} /> : <MicOff size={16} />}
      </div>
    </div>
  )
}
