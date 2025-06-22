import dbConnect from '../../../lib/mongodb'
import Product from '../../../models/Product'

export default async function handler(req, res) {
  await dbConnect()

  const { method } = req
  const { id } = req.query

  switch (method) {
    case 'GET':
      try {
        const product = await Product.findById(id).populate("batchId", "batchNumber supplier arrivalDate")

        if (!product) {
          return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json(product)
      } catch (error) {
        console.error("Get product error:", error)
        res.status(500).json({ message: "Server error" })
      }
      break

    case 'PUT':
      try {
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })

        if (!product) {
          return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json(product)
      } catch (error) {
        if (error.code === 11000) {
          return res.status(400).json({ message: "SKU already exists" })
        }
        console.error("Update product error:", error)
        res.status(500).json({ message: "Server error" })
      }
      break

    case 'DELETE':
      try {
        const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true })

        if (!product) {
          return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json({ message: "Product deleted successfully" })
      } catch (error) {
        console.error("Delete product error:", error)
        res.status(500).json({ message: "Server error" })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 