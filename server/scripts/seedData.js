const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
const User = require("../models/User")

// Load environment variables
dotenv.config()

const seedData = async () => {
  try {
    // Connect to MongoDB using environment variable
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

    // Clear existing data
    await User.deleteMany({})
    console.log("🧹 Cleared existing user data")

    // Create users only
    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@sheelwaterproofing.com",
        password: "loltheblank@CR7",
        role: "admin",
      },
      {
        name: "Regular User",
        email: "user@sheelwaterproofing.com",
        password: "user@sheel",
        role: "user",
      },
    ])
    console.log("👥 Created users:")
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`)
    })

    console.log("\n✅ Database initialized successfully!")
    console.log("🔑 Login credentials:")
    console.log("   Admin: admin@sheelwaterproofing.com / loltheblank@CR7")
    console.log("   User:  user@sheelwaterproofing.com / user@sheel")
    console.log("\n💡 You can now log in and start adding your own data!")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding data:", error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedData()
}

module.exports = seedData
