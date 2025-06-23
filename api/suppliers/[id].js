import dbConnect from '../../../lib/mongodb'
import Supplier from '../../../models/Supplier'

export default async function handler(req, res) {
  await dbConnect()
  const { method } = req
  const { id } = req.query
  switch (method) {
    case 'GET':
      try {
        const supplier = await Supplier.findById(id)
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' })
        res.status(200).json(supplier)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'PUT':
      try {
        const supplier = await Supplier.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' })
        res.status(200).json(supplier)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'DELETE':
      try {
        const supplier = await Supplier.findByIdAndDelete(id)
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' })
        res.status(200).json({ message: 'Supplier deleted successfully' })
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 