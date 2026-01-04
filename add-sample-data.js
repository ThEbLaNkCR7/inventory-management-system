import mongoose from 'mongoose'
import Product from './models/Product.js'
import Client from './models/Client.js'
import Supplier from './models/Supplier.js'
import Sale from './models/Sale.js'
import Purchase from './models/Purchase.js'
import Batch from './models/Batch.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://loltheblank:ZoLeWOgpnUp13UeT@sheel-inventory.3tvwz08.mongodb.net/?retryWrites=true&w=majority&appName=sheel-inventory'

console.log('🚀 Adding sample data to MongoDB Atlas...\n')

// Sample Products
const sampleProducts = [
  {
    name: "Rice",
    category: "Grains",
    netWeight: 25,
    unitPrice: 1200,
    stockQuantity: 100,
    supplier: "Nepal Food Suppliers",
    hsCode: "1006.30",
    isActive: true
  },
  {
    name: "Rice",
    category: "Grains", 
    netWeight: 10,
    unitPrice: 500,
    stockQuantity: 50,
    supplier: "Nepal Food Suppliers",
    hsCode: "1006.30",
    isActive: true
  },
  {
    name: "Wheat Flour",
    category: "Grains",
    netWeight: 20,
    unitPrice: 800,
    stockQuantity: 75,
    supplier: "Kathmandu Mills",
    hsCode: "1101.00",
    isActive: true
  },
  {
    name: "Sugar",
    category: "Sweeteners",
    netWeight: 25,
    unitPrice: 1500,
    stockQuantity: 60,
    supplier: "Nepal Sugar Co.",
    hsCode: "1701.99",
    isActive: true
  },
  {
    name: "Cooking Oil",
    category: "Oils",
    netWeight: 5,
    unitPrice: 400,
    stockQuantity: 80,
    supplier: "Nepal Oil Refinery",
    hsCode: "1507.90",
    isActive: true
  },
  {
    name: "Cooking Oil",
    category: "Oils",
    netWeight: 1,
    unitPrice: 85,
    stockQuantity: 120,
    supplier: "Nepal Oil Refinery", 
    hsCode: "1507.90",
    isActive: true
  },
  {
    name: "Tea",
    category: "Beverages",
    netWeight: 0.5,
    unitPrice: 200,
    stockQuantity: 200,
    supplier: "Nepal Tea Estate",
    hsCode: "0902.40",
    isActive: true
  },
  {
    name: "Coffee",
    category: "Beverages",
    netWeight: 0.25,
    unitPrice: 300,
    stockQuantity: 150,
    supplier: "Nepal Coffee Co.",
    hsCode: "0901.11",
    isActive: true
  },
  {
    name: "Salt",
    category: "Seasonings",
    netWeight: 1,
    unitPrice: 25,
    stockQuantity: 300,
    supplier: "Nepal Salt Corp",
    hsCode: "2501.00",
    isActive: true
  },
  {
    name: "Pulses",
    category: "Legumes",
    netWeight: 5,
    unitPrice: 350,
    stockQuantity: 90,
    supplier: "Nepal Pulses Ltd",
    hsCode: "0713.90",
    isActive: true
  },
  {
    name: "Spices Mix",
    category: "Seasonings",
    netWeight: 0.5,
    unitPrice: 150,
    stockQuantity: 180,
    supplier: "Nepal Spices Co.",
    hsCode: "0910.99",
    isActive: true
  },
  {
    name: "Noodles",
    category: "Processed Foods",
    netWeight: 0.1,
    unitPrice: 15,
    stockQuantity: 500,
    supplier: "Nepal Noodles Ltd",
    hsCode: "1902.30",
    isActive: true
  }
]

// Sample Clients
const sampleClients = [
  {
    name: "Ram Bahadur Thapa",
    email: "ram.thapa@email.com",
    phone: "9841234567",
    company: "Individual",
    address: "Kathmandu, Nepal",
    creditLimit: 50000,
    currentBalance: 0,
    isActive: true
  },
  {
    name: "Sita Devi Shrestha",
    email: "sita.shrestha@email.com", 
    phone: "9842345678",
    company: "Individual",
    address: "Lalitpur, Nepal",
    creditLimit: 30000,
    currentBalance: 0,
    isActive: true
  },
  {
    name: "ABC Restaurant",
    email: "info@abcrestaurant.com",
    phone: "014234567",
    company: "Company",
    address: "Thamel, Kathmandu",
    creditLimit: 200000,
    currentBalance: 0,
    isActive: true
  },
  {
    name: "XYZ Hotel",
    email: "contact@xyzhotel.com",
    phone: "014345678",
    company: "Company", 
    address: "Durbar Marg, Kathmandu",
    creditLimit: 500000,
    currentBalance: 0,
    isActive: true
  },
  {
    name: "PQR Catering",
    email: "service@pqrcatering.com",
    phone: "014456789",
    company: "Company",
    address: "Baneshwor, Kathmandu",
    creditLimit: 150000,
    currentBalance: 0,
    isActive: true
  },
  {
    name: "MNO Supermarket",
    email: "info@mnosupermarket.com",
    phone: "014567890",
    company: "Company",
    address: "New Road, Kathmandu",
    creditLimit: 300000,
    currentBalance: 0,
    isActive: true
  },
  {
    name: "Krishna Kumar",
    email: "krishna.kumar@email.com",
    phone: "9843456789",
    company: "Individual",
    address: "Bhaktapur, Nepal",
    creditLimit: 25000,
    currentBalance: 0,
    isActive: true
  },
  {
    name: "DEF Bakery",
    email: "orders@defbakery.com",
    phone: "014678901",
    company: "Company",
    address: "Patan, Lalitpur",
    creditLimit: 100000,
    currentBalance: 0,
    isActive: true
  },
  {
    name: "GHI Cafe",
    email: "hello@ghicafe.com",
    phone: "014789012",
    company: "Company",
    address: "Jhamsikhel, Lalitpur",
    creditLimit: 75000,
    currentBalance: 0,
    isActive: true
  },
  {
    name: "JKL Grocery",
    email: "contact@jklgrocery.com",
    phone: "014890123",
    company: "Company",
    address: "Kirtipur, Kathmandu",
    creditLimit: 120000,
    currentBalance: 0,
    isActive: true
  },
  {
    name: "Sunita Tamang",
    email: "sunita.tamang@email.com",
    phone: "9844567890",
    company: "Individual",
    address: "Kirtipur, Kathmandu",
    creditLimit: 20000,
    currentBalance: 0,
    isActive: true
  },
  {
    name: "STU Restaurant",
    email: "info@sturestaurant.com",
    phone: "014901234",
    company: "Company",
    address: "Boudha, Kathmandu",
    creditLimit: 180000,
    currentBalance: 0,
    isActive: true
  }
]

// Sample Suppliers
const sampleSuppliers = [
  {
    name: "Nepal Food Suppliers",
    email: "contact@nepalfood.com",
    phone: "014123456",
    company: "Company",
    address: "Kalimati, Kathmandu",
    status: "Active",
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0]
  },
  {
    name: "Kathmandu Mills",
    email: "info@kathmandumills.com",
    phone: "014234567",
    company: "Company",
    address: "Balaju, Kathmandu",
    status: "Active",
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0]
  },
  {
    name: "Nepal Sugar Co.",
    email: "sales@nepalsugar.com",
    phone: "014345678",
    company: "Company",
    address: "Birgunj, Parsa",
    status: "Active",
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0]
  },
  {
    name: "Nepal Oil Refinery",
    email: "info@nepaloil.com",
    phone: "014456789",
    company: "Company",
    address: "Amlekhgunj, Bara",
    status: "Active",
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0]
  },
  {
    name: "Nepal Tea Estate",
    email: "contact@nepaltea.com",
    phone: "014567890",
    company: "Company",
    address: "Ilam, Nepal",
    status: "Active",
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0]
  },
  {
    name: "Nepal Coffee Co.",
    email: "info@nepalcoffee.com",
    phone: "014678901",
    company: "Company",
    address: "Gulmi, Nepal",
    status: "Active",
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0]
  },
  {
    name: "Nepal Salt Corp",
    email: "sales@nepalsalt.com",
    phone: "014789012",
    company: "Company",
    address: "Pokhara, Kaski",
    status: "Active",
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0]
  },
  {
    name: "Nepal Pulses Ltd",
    email: "contact@nepalpulses.com",
    phone: "014890123",
    company: "Company",
    address: "Chitwan, Nepal",
    status: "Active",
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0]
  },
  {
    name: "Nepal Spices Co.",
    email: "info@nepalspices.com",
    phone: "014901234",
    company: "Company",
    address: "Sunsari, Nepal",
    status: "Active",
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0]
  },
  {
    name: "Nepal Noodles Ltd",
    email: "sales@nepalnoodles.com",
    phone: "014012345",
    company: "Company",
    address: "Hetauda, Makwanpur",
    status: "Active",
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0]
  },
  {
    name: "Himalayan Foods",
    email: "contact@himalayanfoods.com",
    phone: "014123789",
    company: "Company",
    address: "Dharan, Sunsari",
    status: "Active",
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0]
  },
  {
    name: "Everest Suppliers",
    email: "info@everestsuppliers.com",
    phone: "014234890",
    company: "Company",
    address: "Biratnagar, Morang",
    status: "Active",
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0]
  }
]

async function addSampleData() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Add Products
    console.log('📦 Adding sample products...')
    for (const productData of sampleProducts) {
      const existingProduct = await Product.findOne({
        name: productData.name,
        netWeight: productData.netWeight,
        supplier: productData.supplier
      })
      
      if (!existingProduct) {
        const product = new Product(productData)
        await product.save()
        console.log(`✅ Added product: ${productData.name} (${productData.netWeight}kg)`)
      } else {
        console.log(`⏭️  Product already exists: ${productData.name} (${productData.netWeight}kg)`)
      }
    }

    // Add Clients
    console.log('\n👥 Adding sample clients...')
    for (const clientData of sampleClients) {
      const existingClient = await Client.findOne({
        name: clientData.name,
        email: clientData.email
      })
      
      if (!existingClient) {
        const client = new Client(clientData)
        await client.save()
        console.log(`✅ Added client: ${clientData.name}`)
      } else {
        console.log(`⏭️  Client already exists: ${clientData.name}`)
      }
    }

    // Add Suppliers
    console.log('\n🏢 Adding sample suppliers...')
    for (const supplierData of sampleSuppliers) {
      const existingSupplier = await Supplier.findOne({
        name: supplierData.name,
        email: supplierData.email
      })
      
      if (!existingSupplier) {
        const supplier = new Supplier(supplierData)
        await supplier.save()
        console.log(`✅ Added supplier: ${supplierData.name}`)
      } else {
        console.log(`⏭️  Supplier already exists: ${supplierData.name}`)
      }
    }

    // Get some products and clients for sample transactions
    const products = await Product.find().limit(5)
    const clients = await Client.find().limit(5)
    const suppliers = await Supplier.find().limit(5)

    // Add Sample Sales
    console.log('\n💰 Adding sample sales...')
    const sampleSales = []
    for (let i = 0; i < 10; i++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const client = clients[Math.floor(Math.random() * clients.length)]
      const quantity = Math.floor(Math.random() * 10) + 1
      
      sampleSales.push({
        productId: product._id,
        productName: product.name,
        client: client.name,
        clientType: client.company,
        quantitySold: quantity,
        salePrice: product.unitPrice,
        saleDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        netWeight: product.netWeight
      })
    }

    for (const saleData of sampleSales) {
      const sale = new Sale(saleData)
      await sale.save()
      console.log(`✅ Added sale: ${saleData.productName} to ${saleData.client}`)
    }

    // Add Sample Purchases
    console.log('\n📦 Adding sample purchases...')
    const samplePurchases = []
    for (let i = 0; i < 10; i++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
      const quantity = Math.floor(Math.random() * 50) + 10
      
      samplePurchases.push({
        productId: product._id,
        productName: product.name,
        supplier: supplier.name,
        supplierType: "Company", // Fixed to use valid enum value
        quantityPurchased: quantity,
        purchasePrice: product.unitPrice * 0.7, // 30% margin
        purchaseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        netWeight: product.netWeight
      })
    }

    for (const purchaseData of samplePurchases) {
      const purchase = new Purchase(purchaseData)
      await purchase.save()
      console.log(`✅ Added purchase: ${purchaseData.productName} from ${purchaseData.supplier}`)
    }

    // Add Sample Batches
    console.log('\n📦 Adding sample batches...')
    const sampleBatches = []
    for (let i = 1; i <= 10; i++) {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 100) + 50
      
      sampleBatches.push({
        batchNumber: `BATCH-${String(i).padStart(3, '0')}`,
        supplier: supplier.name,
        arrivalDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        items: [{
          productId: product._id,
          productName: product.name,
          quantity: quantity,
          unitCost: product.unitPrice * 0.7,
          expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000)
        }],
        status: ["pending", "received", "processed"][Math.floor(Math.random() * 3)],
        notes: `Sample batch ${i} for testing purposes`
      })
    }

    for (const batchData of sampleBatches) {
      const batch = new Batch(batchData)
      await batch.save()
      console.log(`✅ Added batch: ${batchData.batchNumber} from ${batchData.supplier}`)
    }

    console.log('\n🎉 Sample data added successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Products: ${sampleProducts.length} added`)
    console.log(`   - Clients: ${sampleClients.length} added`)
    console.log(`   - Suppliers: ${sampleSuppliers.length} added`)
    console.log(`   - Sales: 10 added`)
    console.log(`   - Purchases: 10 added`)
    console.log(`   - Batches: 10 added`)

  } catch (error) {
    console.error('❌ Error adding sample data:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

addSampleData() 