import Message from '../model/message.model.js'
import { User } from '../model/user.model.js'

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.userid
    const filteredUsers = await User.getExcept(loggedInUserId)
    res.status(200).json(filteredUsers)
  } catch (error) {
    console.error('Error in getUsersForSidebar controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

export const getMessages = async (req, res) => {
  try {
    const friendId = req.params.id
    const myId = req.user.userid

    const messages = await Message.getConversation({ myId, friendId })
    res.status(200).json(messages)
  } catch (error) {
    console.error('Error in getMessages controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const receiverid = req.params.id
    const senderid = req.user.userid
    const { content, image } = req.body

    const newMessage = await Message.create({
      senderid,
      receiverid,
      content,
      image,
    })

    res.status(201).json(newMessage)
  } catch (error) {
    console.error('Error in sendMessage controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}
