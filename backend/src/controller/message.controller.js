import Message from '../model/message.model.js'
import { User } from '../model/user.model.js'
import { getReceiverSocketId, io } from '../lib/socket.js'
import { NotificationModel } from '../model/notification.model.js'
import { getConnection } from '../lib/db.js'
import sql from 'mssql'

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.userid
    const filteredUsers = await User.getSidebarList(loggedInUserId)
    res.status(200).json(filteredUsers)
  } catch (error) {
    console.error('Error in getUsersForSidebar controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { id: chatId } = req.params
    const myId = req.user.userid
    const isGroup = req.query.isGroup === 'true'

    let messages
    if (isGroup) {
      messages = await Message.getGroupMessages({ groupId: chatId })
    } else {
      messages = await Message.getConversation({ myId, friendId: chatId })
    }

    // Lấy reactions cho tất cả tin nhắn
    const pool = await getConnection()
    const messageIds = messages.map((m) => m.messageid).filter((id) => id)

    if (messageIds.length > 0) {
      const reactionsResult = await pool.request().query(`
          SELECT r.*, u.fullname as userName 
          FROM Reactions r
          JOIN Users u ON r.userid = u.userid
          WHERE r.messageid IN (${messageIds.join(',')})
        `)

      // Group reactions theo messageid
      const reactionsMap = {}
      reactionsResult.recordset.forEach((r) => {
        if (!reactionsMap[r.messageid]) {
          reactionsMap[r.messageid] = []
        }
        reactionsMap[r.messageid].push({
          emoji: r.emoji,
          userId: r.userid,
          userName: r.userName,
        })
      })

      // Gắn reactions vào messages
      messages = messages.map((msg) => ({
        ...msg,
        reactions: reactionsMap[msg.messageid] || [],
      }))
    }

    res.status(200).json(messages)
  } catch (error) {
    console.error('Error in getMessages controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverOrGroupId } = req.params
    const senderid = req.user.userid
    const { content, isGroup, mentions } = req.body

    let file = ''
    if (req.file) {
      file = `/messages/${req.file.filename}`
    }

    if (!content && !file) {
      return res
        .status(400)
        .json({ message: 'Message content or file is required' })
    }

    let newMessage

    if (isGroup === 'true' || isGroup === true) {
      newMessage = await Message.create({
        senderid,
        receiverid: null,
        group_id: receiverOrGroupId,
        content,
        file,
      })

      const roomName = `group_${receiverOrGroupId}`
      io.to(roomName).emit('newMessage', newMessage)
    } else {
      newMessage = await Message.create({
        senderid,
        receiverid: receiverOrGroupId,
        group_id: null,
        content,
        file,
      })

      const receiverSocketId = getReceiverSocketId(receiverOrGroupId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', newMessage)
      }
    }

    res.status(201).json(newMessage)

    if (isGroup === 'true' && mentions) {
      let mentionedIds = []
      try {
        mentionedIds = JSON.parse(mentions)
      } catch (e) {
        mentionedIds = mentions
      }

      if (Array.isArray(mentionedIds) && mentionedIds.length > 0) {
        let groupName = 'nhóm'
        try {
          const pool = await getConnection()
          const groupRes = await pool
            .request()
            .input('id', receiverOrGroupId)
            .query('SELECT name FROM Groups WHERE groupid = @id')
          if (groupRes.recordset[0]) groupName = groupRes.recordset[0].name
        } catch (err) {
          console.error('Lỗi lấy tên nhóm:', err)
        }

        mentionedIds.forEach(async (receiverId) => {
          if (receiverId == senderid) return

          const notif = await NotificationModel.create({
            receiver_id: receiverId,
            sender_id: senderid,
            group_id: receiverOrGroupId,
            type: 'TAG',
            content: `đã nhắc đến bạn trong nhóm ${groupName}`,
          })

          const socketId = getReceiverSocketId(receiverId)
          if (socketId) {
            const notifWithSender = {
              ...notif,
              senderName: req.user.fullname,
              senderPic: req.user.profilepic,
              groupName: groupName,
              groupPic: null,
            }
            io.to(socketId).emit('new-notification', notifWithSender)
          }
        })
      }
    }
  } catch (error) {
    console.error('Error in sendMessage controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

// ========== REACTION APIs ==========

export const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params
    const { emoji } = req.body
    const userId = req.user.userid
    const userName = req.user.fullname

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' })
    }

    const pool = await getConnection()

    const existing = await pool
      .request()
      .input('messageId', sql.Int, messageId)
      .input('userId', sql.Int, userId)
      .input('emoji', sql.NVarChar, emoji)
      .query(
        'SELECT * FROM Reactions WHERE messageid = @messageId AND userid = @userId AND emoji = @emoji'
      )

    let action = ''

    if (existing.recordset.length > 0) {
      await pool
        .request()
        .input('messageId', sql.Int, messageId)
        .input('userId', sql.Int, userId)
        .input('emoji', sql.NVarChar, emoji)
        .query(
          'DELETE FROM Reactions WHERE messageid = @messageId AND userid = @userId AND emoji = @emoji'
        )

      action = 'removed'
    } else {
      await pool
        .request()
        .input('messageId', sql.Int, messageId)
        .input('userId', sql.Int, userId)
        .input('emoji', sql.NVarChar, emoji)
        .query(
          'INSERT INTO Reactions (messageid, userid, emoji) VALUES (@messageId, @userId, @emoji)'
        )

      action = 'added'
    }

    const messageResult = await pool
      .request()
      .input('messageId', sql.Int, messageId)
      .query(
        'SELECT senderid, receiverid, group_id FROM Messages WHERE messageid = @messageId'
      )

    const message = messageResult.recordset[0]

    const reactionData = {
      messageId: parseInt(messageId),
      emoji,
      userId,
      userName,
      action,
    }

    if (message) {
      if (message.group_id) {
        const roomName = `group_${message.group_id}`
        io.to(roomName).emit('messageReaction', reactionData)
      } else {
        const senderSocketId = getReceiverSocketId(message.senderid)
        const receiverSocketId = getReceiverSocketId(message.receiverid)

        if (senderSocketId) {
          io.to(senderSocketId).emit('messageReaction', reactionData)
        }
        if (receiverSocketId && receiverSocketId !== senderSocketId) {
          io.to(receiverSocketId).emit('messageReaction', reactionData)
        }
      }
    }

    res.json({
      success: true,
      action,
      emoji,
      messageId: parseInt(messageId),
      userId,
      userName,
    })
  } catch (error) {
    console.error('Error in toggleReaction controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

export const getReactions = async (req, res) => {
  try {
    const { messageId } = req.params
    const pool = await getConnection()

    const result = await pool
      .request()
      .input('messageId', sql.Int, messageId)
      .query(`
        SELECT r.*, u.fullname as userName 
        FROM Reactions r
        JOIN Users u ON r.userid = u.userid
        WHERE r.messageid = @messageId
      `)

    const reactions = result.recordset.map((r) => ({
      emoji: r.emoji,
      userId: r.userid,
      userName: r.userName,
    }))

    res.json(reactions)
  } catch (error) {
    console.error('Error in getReactions controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

// ========== MARK AS SEEN API ==========

export const markAsSeen = async (req, res) => {
  try {
    const { senderId } = req.params // ID của người gửi tin nhắn
    const viewerId = req.user.userid // ID của người đang xem

    const pool = await getConnection()
    const now = new Date()

    if (isGroup === 'true') {
      await pool
        .request()
        .input('groupId', sql.Int, senderId)
        .input('viewerId', sql.Int, viewerId)
        .input('seenAt', sql.DateTime, now)
        .query(`
          UPDATE Messages 
          SET seen = 1, seenAt = @seenAt 
          WHERE group_id = @groupId 
            AND senderid != @oderId 
            AND (seen = 0 OR seen IS NULL)
        `)
   } else {
      await pool
        .request()
        .input('viewerId', sql.Int, viewerId)
        .input('senderId', sql.Int, senderId)
        .input('seenAt', sql.DateTime, now)
        .query(`
          UPDATE Messages 
          SET seen = 1, seenAt = @seenAt 
          WHERE receiverid = @oderId 
            AND senderid = @senderId 
            AND (seen = 0 OR seen IS NULL)
        `)

      // Emit socket cho người gửi
      const senderSocketId = getReceiverSocketId(senderId)
      if (senderSocketId) {
        io.to(senderSocketId).emit('messagesSeen', {
          viewerId: parseInt(viewerId),
          senderId: parseInt(senderId),
          seenAt: now,
        })
      }
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error in markAsSeen controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}