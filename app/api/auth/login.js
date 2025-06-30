import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../../models/User.js'

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return // Already connected
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Connect to database
    await connectDB()

    const { email, password } = req.body
    console.log('Login attempt for email:', email)

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password')
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email)
      return res.status(400).json({ message: "Invalid email format" })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true })
    console.log('User found:', user ? 'Yes' : 'No')
    
    if (!user) {
      console.log('No user found with email:', email.toLowerCase())
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    console.log('Password match:', isMatch ? 'Yes' : 'No')
    
    if (!isMatch) {
      console.log('Password mismatch for user:', user.email)
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    console.log('Login successful for user:', user.email)

    // Return user data without sensitive information
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    
    // Don't expose internal errors to client
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Invalid input data" })
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.error('Database error:', error.message)
      return res.status(500).json({ message: "Database error" })
    }
    
    res.status(500).json({ message: "Server error" })
  }
} 