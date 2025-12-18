import { useState } from 'react'
import { Smile } from 'lucide-react'

const EMOJI_CATEGORIES = {
  'Mặt cười': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😗', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥'],
  'Cảm xúc': ['😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱'],
  'Cử chỉ': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'Trái tim': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Động vật': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞'],
  'Đồ ăn': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🌮', '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍰', '🎂', '🍩', '🍪', '🍫'],
  'Hoạt động': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🥅', '⛳', '🏹', '🎣', '🥊', '🥋', '🎿', '⛷️', '🏂', '🎮', '🎯', '🎲'],
  'Du lịch': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '✈️', '🚀', '🛸', '🚁', '⛵', '🚢', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏨', '🏩', '🏪'],
}

const EmojiPicker = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('Mặt cười')

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-base-100 shadow-xl border border-base-300 rounded-lg overflow-hidden z-50">
      {/* Header - Categories */}
      <div className="flex overflow-x-auto bg-base-200 p-1 gap-1 scrollbar-hide">
        {Object.keys(EMOJI_CATEGORIES).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-2 py-1 text-xs whitespace-nowrap rounded transition-colors ${
              activeCategory === category
                ? 'bg-primary text-primary-content'
                : 'hover:bg-base-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="p-2 h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect(emoji)
                onClose()
              }}
              className="w-8 h-8 flex items-center justify-center text-xl hover:bg-base-200 rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Button component to toggle emoji picker
export const EmojiButton = ({ onEmojiSelect }) => {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="btn btn-ghost btn-circle btn-sm md:btn-md mb-1"
        title="Chọn emoji"
      >
        <Smile size={18} className="md:w-5 md:h-5" />
      </button>

      {showPicker && (
        <>
          {/* Backdrop to close picker */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPicker(false)}
          />
          <EmojiPicker 
            onSelect={onEmojiSelect} 
            onClose={() => setShowPicker(false)} 
          />
        </>
      )}
    </div>
  )
}

export default EmojiPicker