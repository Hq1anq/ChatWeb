import { User } from '../model/user.model.js'
import bcrypt from 'bcryptjs'
import generateToken from '../lib/utils.js'

export async function signup(req, res) {
  const { Fullname, Email, Password } = req.body

  try {
    if (!Fullname || !Email || !Password)
      return res.status(400).json({ message: 'All fields are required' })

    if (Password.length < 6)
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' })

    const user = await User.findByEmail(Email)

    if (user)
      return res.status(400).json({ message: 'Email is already registered' })

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(Password, salt)

    const newUser = await User.create({
      Email,
      Fullname,
      Password: hashedPassword,
    })

    if (newUser) {
      generateToken(newUser.UserID, res)
      return res.status(201).json({
        UserID: newUser.UserID,
        FullName: newUser.FullName,
        Email: newUser.Email,
        ProfilePic: newUser.ProfilePic,
      })
    } else res.status(400).json({ messave: 'Invalid user data' })
  } catch (error) {
    console.error('Error in signup controller: ', error.message)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export async function login(req, res) {
  const { Email, Password } = req.body

  try {
    const user = await User.findByEmail(Email)
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' })
    }
    const isMatch = await bcrypt.compare(Password, user.Password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' })
    }
    generateToken(user.UserID, res)
    return res.status(200).json({
      UserID: user.UserID,
      FullName: user.FullName,
      Email: user.Email,
      ProfilePic: user.ProfilePic,
    })
  } catch (error) {
    console.error('Error in login controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

export const logout = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 })
    res.status(200).json({ message: 'Logged out successfully.' })
  } catch (error) {
    console.error('Error in logout controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}
