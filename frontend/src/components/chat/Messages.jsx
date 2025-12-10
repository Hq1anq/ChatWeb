import Message from './Message.jsx'
import DateSeparator from './DateSeparator.jsx'
import { useAuthStore } from '../../store/authStore'
import { formatTime, formatDateSeparator, getDateKey } from '../../lib/utils'

const Messages = ({ messages }) => {
  const { user } = useAuthStore()

  // Hàm render messages với date separators
  const renderMessagesWithDates = () => {
    const elements = []
    let lastDateKey = null

    messages.forEach((msg) => {
      const currentDateKey = getDateKey(msg.created)

      // Nếu ngày khác với tin nhắn trước -> thêm separator
      if (currentDateKey !== lastDateKey) {
        elements.push(
          <DateSeparator
            key={`date-${currentDateKey}`}
            date={formatDateSeparator(msg.created)}
          />
        )
        lastDateKey = currentDateKey
      }

      // Thêm tin nhắn
      elements.push(
        <Message
          key={msg.messageid}
          text={msg.content}
          file={msg.file}
          fromMe={msg.senderid === user.userid || msg.senderid === 'me'}
          time={formatTime(msg.created)}
          isTemp={msg.isTemp}
        />
      )
    })

    return elements
  }

  return <div className="flex flex-col gap-2">{renderMessagesWithDates()}</div>
}

export default Messages