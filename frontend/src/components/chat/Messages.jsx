import React from 'react'
import Message from './Message.jsx'
import { useAuthStore } from '../../store/authStore'

const Messages = ({ messages }) => {
  const { user } = useAuthStore()

  // Format thời gian
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg) => (
        <Message
          key={msg.messageid}
          text={msg.content}
          image={msg.image}
          fromMe={msg.senderid === user.userid || msg.senderid === 'me'}
          time={formatTime(msg.created)}
          isTemp={msg.isTemp} // Để hiển thị loading indicator
        />
      ))}
    </div>
  )
}

export default Messages