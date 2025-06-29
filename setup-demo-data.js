import { connectToDatabase } from './lib/mongodb.js'
import Product from './models/Product.js'
import Client from './models/Client.js'
import Supplier from './models/Supplier.js'
import Sale from './models/Sale.js'
import Purchase from './models/Purchase.js'
import User from './models/User.js'

async function setupDemoData() {
  try {
    await connectToDatabase()
    console.log('Connected to database')

    // Clear existing data
    await Product.deleteMany({})
    await Client.deleteMany({})
    await Supplier.deleteMany({})
    await Sale.deleteMany({})
    await Purchase.deleteMany({})
    console.log('Cleared existing data')

    // Demo Products
    const demoProducts = [
      {
        name: "Laptop Dell XPS 13",
        description: "High-performance laptop with 13-inch display",
        category: "Electronics",
        unitPrice: 85000,
        stockQuantity: 25,
        minStockLevel: 5,
        supplier: "Tech Solutions Ltd",
        hsCode: "8471.30.00",
        isActive: true
      },
      {
        name: "Wireless Mouse Logitech MX Master",
        description: "Premium wireless mouse with ergonomic design",
        category: "Accessories",
        unitPrice: 4500,
        stockQuantity: 50,
        minStockLevel: 10,
        supplier: "Computer Accessories Co",
        hsCode: "8471.60.00",
        isActive: true
      }
    ]

    const createdProducts = await Product.insertMany(demoProducts)
    console.log('Added demo products:', createdProducts.map(p => p.name))

    // Demo Clients
    const demoClients = [
      {
        name: "Rajesh Kumar",
        email: "rajesh.kumar@techcorp.com",
        phone: "+977-9841234567",
        company: "TechCorp Solutions",
        address: {
          street: "123 Business Park, Thamel",
          city: "Kathmandu",
          state: "Bagmati",
          zipCode: "44600",
          country: "Nepal"
        },
        taxId: "TAX123456789",
        creditLimit: 100000,
        currentBalance: 25000,
        totalSpent: 75000,
        orders: 3,
        lastOrder: new Date('2024-01-15'),
        isActive: true
      },
      {
        name: "Priya Sharma",
        email: "priya.sharma@innovate.com",
        phone: "+977-9852345678",
        company: "Innovate Digital",
        address: {
          street: "456 Innovation Street, Patan",
          city: "Lalitpur",
          state: "Bagmati",
          zipCode: "44700",
          country: "Nepal"
        },
        taxId: "TAX987654321",
        creditLimit: 150000,
        currentBalance: 0,
        totalSpent: 120000,
        orders: 5,
        lastOrder: new Date('2024-01-20'),
        isActive: true
      }
    ]

    const createdClients = await Client.insertMany(demoClients)
    console.log('Added demo clients:', createdClients.map(c => c.name))

    // Demo Suppliers
    const demoSuppliers = [
      {
        name: "Tech Solutions Ltd",
        email: "contact@techsolutions.com",
        phone: "+977-1-4444444",
        company: "Tech Solutions Ltd",
        address: "789 Industrial Area, Biratnagar",
        status: "Active",
        orders: 8,
        totalSpent: 450000,
        lastOrder: new Date('2024-01-18')
      },
      {
        name: "Computer Accessories Co",
        email: "sales@compaccessories.com",
        phone: "+977-1-5555555",
        company: "Computer Accessories Co",
        address: "321 Warehouse District, Pokhara",
        status: "Active",
        orders: 12,
        totalSpent: 320000,
        lastOrder: new Date('2024-01-22')
      }
    ]

    const createdSuppliers = await Supplier.insertMany(demoSuppliers)
    console.log('Added demo suppliers:', createdSuppliers.map(s => s.name))

    // Demo Sales
    const demoSales = [
      {
        productName: "Laptop Dell XPS 13",
        client: "Rajesh Kumar",
        quantitySold: 2,
        salePrice: 85000,
        totalAmount: 170000,
        saleDate: new Date('2024-01-15'),
        paymentMethod: "Bank Transfer",
        status: "Completed"
      },
      {
        productName: "Wireless Mouse Logitech MX Master",
        client: "Priya Sharma",
        quantitySold: 5,
        salePrice: 4500,
        totalAmount: 22500,
        saleDate: new Date('2024-01-20'),
        paymentMethod: "Cash",
        status: "Completed"
      },
      {
        productName: "Laptop Dell XPS 13",
        client: "Priya Sharma",
        quantitySold: 1,
        salePrice: 85000,
        totalAmount: 85000,
        saleDate: new Date('2024-01-10'),
        paymentMethod: "Credit",
        status: "Completed"
      },
      {
        productName: "Wireless Mouse Logitech MX Master",
        client: "Rajesh Kumar",
        quantitySold: 3,
        salePrice: 4500,
        totalAmount: 13500,
        saleDate: new Date('2024-01-05'),
        paymentMethod: "Bank Transfer",
        status: "Completed"
      }
    ]

    const createdSales = await Sale.insertMany(demoSales)
    console.log('Added demo sales:', createdSales.length, 'transactions')

    // Demo Purchases
    const demoPurchases = [
      {
        productName: "Laptop Dell XPS 13",
        supplier: "Tech Solutions Ltd",
        quantityPurchased: 30,
        purchasePrice: 75000,
        totalAmount: 2250000,
        purchaseDate: new Date('2024-01-01'),
        paymentMethod: "Bank Transfer",
        status: "Completed"
      },
      {
        productName: "Wireless Mouse Logitech MX Master",
        supplier: "Computer Accessories Co",
        quantityPurchased: 60,
        purchasePrice: 3500,
        totalAmount: 210000,
        purchaseDate: new Date('2024-01-03'),
        paymentMethod: "Bank Transfer",
        status: "Completed"
      },
      {
        productName: "Laptop Dell XPS 13",
        supplier: "Tech Solutions Ltd",
        quantityPurchased: 15,
        purchasePrice: 78000,
        totalAmount: 1170000,
        purchaseDate: new Date('2024-01-12'),
        paymentMethod: "Credit",
        status: "Completed"
      },
      {
        productName: "Wireless Mouse Logitech MX Master",
        supplier: "Computer Accessories Co",
        quantityPurchased: 25,
        purchasePrice: 3600,
        totalAmount: 90000,
        purchaseDate: new Date('2024-01-08'),
        paymentMethod: "Cash",
        status: "Completed"
      }
    ]

    const createdPurchases = await Purchase.insertMany(demoPurchases)
    console.log('Added demo purchases:', createdPurchases.length, 'transactions')

    // Create demo admin user if not exists
    const existingAdmin = await User.findOne({ email: 'admin@demo.com' })
    if (!existingAdmin) {
      await User.create({
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin',
        isActive: true
      })
      console.log('Created demo admin user: admin@demo.com / password')
    }

    // Create demo employee user if not exists
    const existingEmployee = await User.findOne({ email: 'employee@demo.com' })
    if (!existingEmployee) {
      await User.create({
        name: 'Demo Employee',
        email: 'employee@demo.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'employee',
        isActive: true
      })
      console.log('Created demo employee user: employee@demo.com / password')
    }

    console.log('\n✅ Demo data setup completed successfully!')
    console.log('\n📊 Demo Data Summary:')
    console.log('- Products: 2 items')
    console.log('- Clients: 2 contacts')
    console.log('- Suppliers: 2 vendors')
    console.log('- Sales: 4 transactions')
    console.log('- Purchases: 4 transactions')
    console.log('\n👤 Demo Users:')
    console.log('- Admin: admin@demo.com / password')
    console.log('- Employee: employee@demo.com / password')
    console.log('\n🚀 You can now test all features with this demo data!')

  } catch (error) {
    console.error('Error setting up demo data:', error)
  } finally {
    process.exit(0)
  }
}

setupDemoData() 