import dbConnect from '../../lib/mongodb'
import Supplier from '../../models/Supplier'

export default async function handler(req, res) {
  await dbConnect()
  const { method } = req
  switch (method) {
    case 'GET':
      try {
        const suppliers = await Supplier.find({})
        res.status(200).json({ suppliers })
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'POST':
      try {
        const supplier = new Supplier(req.body)
        await supplier.save()
        res.status(201).json(supplier)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 