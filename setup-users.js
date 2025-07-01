import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

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

const setupUsers = async () => {
  try {
    await connectDB()

    // Check if users already exist
    const existingUsers = await User.find({})
    if (existingUsers.length > 0) {
      console.log('Users already exist in database:')
      existingUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`)
      })
      return
    }

    // Create test users
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@sheelwaterproofing.com',
        password: 'loltheblank@ronaldosaurav2',
        role: 'admin',
        isActive: true
      },
    ]

    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isActive: userData.isActive,
        createdAt: new Date()
      })

      await user.save()
      console.log(`Created user: ${user.name} (${user.email})`)
    }

    console.log('\nTest users created successfully!')
    console.log('\nLogin credentials:')
    console.log('Admin: admin@sheelwaterproofing.com / loltheblank@ronaldosaurav2')
    console.log('Manager: manager@example.com / manager123')
    console.log('Employee: employee@example.com / employee123')

  } catch (error) {
    console.error('Error setting up users:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Database disconnected')
  }
}

// Run the setup
setupUsers() 