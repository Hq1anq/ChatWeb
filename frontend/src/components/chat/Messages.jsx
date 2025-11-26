import Message from './Message.jsx'
import { useAuthStore } from '../../store/authStore'
import { formatTime } from '../../lib/utils'

const Messages = ({ messages }) => {
  const { user } = useAuthStore()

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
