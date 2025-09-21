import { User } from '../model/user.model.js'
import bcrypt from 'bcryptjs'
import generateToken from '../lib/utils.js'

export async function signup(req, res) {
  const { fullname, email, password } = req.body

  try {
    if (!fullname || !email || !password)
      return res.status(400).json({ message: 'All fields are required' })

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' })

    const user = await User.findByEmail(email)

    if (user)
      return res.status(400).json({ message: 'Email is already registered' })

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await User.create({
      email,
      fullname,
      password: hashedPassword,
    })

    if (newUser) {
      generateToken(newUser.userid, res)
      return res.status(201).json({
        userid: newUser.userid,
        fullname: newUser.fullname,
        email: newUser.email,
        profilepic: newUser.profilepic,
      })
    } else res.status(400).json({ messave: 'Invalid user data' })
  } catch (error) {
    console.error('Error in signup controller: ', error.message)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export async function login(req, res) {
  const { email, password } = req.body

  try {
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' })
    }
    generateToken(user.userid, res)
    return res.status(200).json({
      userid: user.userid,
      fullname: user.fullname,
      email: user.email,
      profilepic: user.profilepic,
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
