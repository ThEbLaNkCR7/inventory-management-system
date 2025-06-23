import dbConnect from '../../../lib/mongodb'
import Sale from '../../../models/Sale'

export default async function handler(req, res) {
  await dbConnect()
  const { method } = req
  const { id } = req.query
  switch (method) {
    case 'GET':
      try {
        const sale = await Sale.findById(id)
        if (!sale) return res.status(404).json({ message: 'Sale not found' })
        res.status(200).json(sale)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'PUT':
      try {
        const sale = await Sale.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        if (!sale) return res.status(404).json({ message: 'Sale not found' })
        res.status(200).json(sale)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'DELETE':
      try {
        const sale = await Sale.findByIdAndDelete(id)
        if (!sale) return res.status(404).json({ message: 'Sale not found' })
        res.status(200).json({ message: 'Sale deleted successfully' })
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 