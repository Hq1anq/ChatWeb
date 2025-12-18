import { X, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'

const ImageLightbox = ({ src, alt, onClose }) => {
  const [scale, setScale] = useState(1)

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = alt || 'image'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Lỗi khi tải ảnh:', error)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={handleZoomOut}
          className="btn btn-circle btn-sm bg-white/10 hover:bg-white/20 border-none text-white"
          title="Thu nhỏ"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleZoomIn}
          className="btn btn-circle btn-sm bg-white/10 hover:bg-white/20 border-none text-white"
          title="Phóng to"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleDownload}
          className="btn btn-circle btn-sm bg-white/10 hover:bg-white/20 border-none text-white"
          title="Tải xuống"
        >
          <Download size={18} />
        </button>
        <button
          onClick={onClose}
          className="btn btn-circle btn-sm bg-white/10 hover:bg-white/20 border-none text-white"
          title="Đóng"
        >
          <X size={18} />
        </button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 px-3 py-1 rounded-full text-white text-sm">
        {Math.round(scale * 100)}%
      </div>

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-200 cursor-move"
        style={{ transform: `scale(${scale})` }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

export default ImageLightbox