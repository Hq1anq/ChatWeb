import { useEffect, useRef } from 'react'
import { Mic, MicOff, VideoOff } from 'lucide-react'

export default function VideoContainer({
  stream,
  isLocal,
  isMicrophoneOn,
  isCameraOn,
  layoutMode,
}) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const containerClasses =
    layoutMode === 'split'
      ? 'relative flex-1 flex items-center justify-center bg-black overflow-hidden p-2'
      : isLocal
      ? 'absolute right-4 bottom-24 w-[30vw] h-[30vh] max-w-[240px] max-h-[180px] z-20 shadow-2xl rounded-lg overflow-hidden border border-white/20 bg-gray-900'
      : 'absolute inset-0 w-full h-full z-10 bg-black'

  return (
    <div className={containerClasses}>
      {/* Sử dụng object-contain để hiển thị trọn vẹn khung hình (không crop). 
         Nếu tỉ lệ video khác tỉ lệ khung hình, sẽ có khoảng đen.
      */}
      <video
        ref={videoRef}
        className={`w-full h-full object-contain`}
        autoPlay
        playsInline
        muted={isLocal}
      />

      {/* Icon khi tắt Camera */}
      {!isCameraOn && (
        <div className="flex items-center justify-center w-full h-full bg-gray-800">
          <div className="p-6 bg-gray-700 rounded-full">
            <VideoOff
              size={isLocal && layoutMode !== 'split' ? 24 : 48}
              className="text-gray-400"
            />
          </div>
        </div>
      )}

      {/* Label/Icon Micro */}
      <div className="absolute left-2 bottom-2 bg-black/60 text-white px-2 py-1 rounded-md flex items-center gap-2 text-xs">
        {isMicrophoneOn ? (
          <Mic size={14} />
        ) : (
          <MicOff size={14} className="text-red-500" />
        )}
        <span>{isLocal ? 'Bạn' : ''}</span>
      </div>
    </div>
  )
}
