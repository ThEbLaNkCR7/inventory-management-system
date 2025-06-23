import dbConnect from '../../../lib/mongodb'
import Purchase from '../../../models/Purchase'

export default async function handler(req, res) {
  await dbConnect()
  const { method } = req
  const { id } = req.query
  switch (method) {
    case 'GET':
      try {
        const purchase = await Purchase.findById(id)
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' })
        res.status(200).json(purchase)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'PUT':
      try {
        const purchase = await Purchase.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' })
        res.status(200).json(purchase)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'DELETE':
      try {
        const purchase = await Purchase.findByIdAndDelete(id)
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' })
        res.status(200).json({ message: 'Purchase deleted successfully' })
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 