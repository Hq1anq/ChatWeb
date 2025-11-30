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
    } else res.status(400).json({ message: 'Invalid user data' })
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
      bio: user.bio || ""
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

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    console.log('Error in checkAuth controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

export const updateProfilePic = async (req, res) => {
  try {
    const userId = req.user.userid
    const profilepic = req.file
      ? `/profilepics/${req.file.filename}`
      : req.user.profilepic

    if (!profilepic) {
      return res.status(400).json({ message: 'Profile picture is required' })
    }

    const updatedUser = await User.updateProfilePic(userId, profilepic)
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      userid: updatedUser.userid,
      fullname: updatedUser.fullname,
      email: updatedUser.email,
      profilepic: updatedUser.profilepic,
    })
  } catch (error) {
    console.log('Error in updateProfile controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

export const updateProfileBio = async (req, res) => {
  try {
    const { bio } = req.body;
    const userId = req.user.userid;

    // Optional: Kiểm tra độ dài bio trước khi lưu
    if (bio && bio.length > 500) {
        return res.status(400).json({ message: "Bio không được quá 500 ký tự" });
    }

    const updatedUser = await User.updateBio(userId, bio);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfileBio:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.userid

    // 1. Validate đầu vào
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" })
    }

    // 2. Lấy thông tin user từ DB để lấy mật khẩu cũ (đã hash)
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "User not found" })

    // 3. So sánh mật khẩu cũ nhập vào với mật khẩu trong DB
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" })
    }

    // 4. Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // 5. Lưu vào DB
    await User.updatePassword(userId, hashedPassword)

    res.status(200).json({ message: "Đổi mật khẩu thành công" })

  } catch (error) {
    console.log("Error in updatePassword:", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
