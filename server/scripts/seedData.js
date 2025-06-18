const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const Product = require("../models/Product")
const Client = require("../models/Client")
const Supplier = require("../models/Supplier")
const Batch = require("../models/Batch")

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/inventory_management")
    console.log("Connected to MongoDB")

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Client.deleteMany({}),
      Supplier.deleteMany({}),
      Batch.deleteMany({}),
    ])
    console.log("Cleared existing data")

    // Create users
    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@demo.com",
        password: "admin123",
        role: "admin",
      },
      {
        name: "Regular User",
        email: "user@demo.com",
        password: "user123",
        role: "user",
      },
    ])
    console.log("Created users")

    // Create suppliers
    const suppliers = await Supplier.create([
      {
        name: "Dell Sales Rep",
        email: "sales@dell.com",
        phone: "+1-555-0456",
        company: "Dell Inc.",
        address: {
          street: "123 Tech Street",
          city: "Austin",
          state: "TX",
          zipCode: "78701",
          country: "USA",
        },
      },
      {
        name: "Apple Sales Rep",
        email: "sales@apple.com",
        phone: "+1-555-0789",
        company: "Apple Inc.",
        address: {
          street: "1 Apple Park Way",
          city: "Cupertino",
          state: "CA",
          zipCode: "95014",
          country: "USA",
        },
      },
      {
        name: "Office Furniture Rep",
        email: "sales@officefurniture.com",
        phone: "+1-555-0123",
        company: "Office Furniture Co.",
        address: {
          street: "456 Business Ave",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          country: "USA",
        },
      },
    ])
    console.log("Created suppliers")

    // Create clients
    const clients = await Client.create([
      {
        name: "John Smith",
        email: "john@techcorp.com",
        phone: "+1-555-0123",
        company: "Tech Corp",
        address: {
          street: "789 Corporate Blvd",
          city: "San Francisco",
          state: "CA",
          zipCode: "94105",
          country: "USA",
        },
        creditLimit: 50000,
      },
      {
        name: "Sarah Johnson",
        email: "sarah@innovate.com",
        phone: "+1-555-0456",
        company: "Innovate Solutions",
        address: {
          street: "321 Innovation Dr",
          city: "Seattle",
          state: "WA",
          zipCode: "98101",
          country: "USA",
        },
        creditLimit: 75000,
      },
    ])
    console.log("Created clients")

    // Create batches
    const batches = await Batch.create([
      {
        batchNumber: "BATCH-2024-001",
        supplier: "Dell Inc.",
        arrivalDate: new Date("2024-01-15"),
        items: [
          {
            productName: "Laptop Dell XPS 13",
            quantity: 20,
            unitCost: 1000,
          },
        ],
        status: "received",
      },
      {
        batchNumber: "BATCH-2024-002",
        supplier: "Apple Inc.",
        arrivalDate: new Date("2024-01-20"),
        items: [
          {
            productName: "iPhone 15 Pro",
            quantity: 15,
            unitCost: 850,
          },
        ],
        status: "received",
      },
    ])
    console.log("Created batches")

    // Create products
    const products = await Product.create([
      {
        name: "Laptop Dell XPS 13",
        sku: "DELL-XPS-001",
        description: "High-performance ultrabook",
        category: "Electronics",
        stockQuantity: 15,
        unitPrice: 1200,
        supplier: "Dell Inc.",
        batchId: batches[0]._id,
        batchNumber: batches[0].batchNumber,
        stockType: "new",
        lastRestocked: new Date("2024-01-15"),
      },
      {
        name: "iPhone 15 Pro",
        sku: "APPLE-IP15-001",
        description: "Latest iPhone model",
        category: "Electronics",
        stockQuantity: 8,
        unitPrice: 999,
        supplier: "Apple Inc.",
        batchId: batches[1]._id,
        batchNumber: batches[1].batchNumber,
        stockType: "new",
        lastRestocked: new Date("2024-01-20"),
      },
      {
        name: "Office Chair",
        sku: "FURN-CHAIR-001",
        description: "Ergonomic office chair",
        category: "Furniture",
        stockQuantity: 3,
        unitPrice: 250,
        supplier: "Office Furniture Co.",
        stockType: "old",
        lastRestocked: new Date("2023-12-01"),
      },
      {
        name: "Wireless Mouse",
        sku: "TECH-MOUSE-001",
        description: "Bluetooth wireless mouse",
        category: "Electronics",
        stockQuantity: 25,
        unitPrice: 45,
        supplier: "Tech Accessories Inc.",
        stockType: "new",
        lastRestocked: new Date("2024-01-10"),
      },
      {
        name: "Standing Desk",
        sku: "FURN-DESK-001",
        description: "Adjustable height standing desk",
        category: "Furniture",
        stockQuantity: 2,
        unitPrice: 599,
        supplier: "Office Furniture Co.",
        stockType: "old",
        lastRestocked: new Date("2023-11-15"),
      },
    ])
    console.log("Created products")

    // Update batch items with product IDs
    batches[0].items[0].productId = products[0]._id
    batches[1].items[0].productId = products[1]._id

    await batches[0].save()
    await batches[1].save()
    console.log("Updated batch items with product IDs")

    console.log("Seed data created successfully!")
    console.log("Login credentials:")
    console.log("Admin: admin@demo.com / admin123")
    console.log("User: user@demo.com / user123")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding data:", error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedData()
}

module.exports = seedData
