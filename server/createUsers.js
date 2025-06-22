const mongoose = require("mongoose")
const dotenv = require("dotenv")
const User = require("./models/User")

// Load environment variables
dotenv.config()

const createUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error("❌ MONGODB_URI not found in environment variables")
      console.log("📝 Please create a .env file with your MongoDB URI")
      process.exit(1)
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("✅ Connected to MongoDB")

    // Check if users already exist
    const existingUsers = await User.find({})
    if (existingUsers.length > 0) {
      console.log("👥 Users already exist:")
      existingUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`)
      })
      console.log("\n🔑 Login Credentials:")
      process.exit(0)
    }

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@sheelwaterproofing.com",
      password: "loltheblank@CR7",
      role: "admin",
    })
    await adminUser.save()

    // Create regular user
    const regularUser = new User({
      name: "Regular User",
      email: "user@sheelwaterproofing.com",
      password: "user@sheel",
      role: "user",
    })
    await regularUser.save()

    console.log("✅ Users created successfully!")
    console.log("\n🔑 Login Credentials:")
    console.log("   Admin: admin@sheelwaterproofing.com / loltheblank@CR7")
    console.log("   User:  user@sheelwaterproofing.com / user@sheel")
    console.log("\n💡 You can now log in and start adding your own data!")

  } catch (error) {
    console.error("❌ Error creating users:", error)
  } finally {
    await mongoose.connection.close()
    process.exit(0)
  }
}

createUsers() 