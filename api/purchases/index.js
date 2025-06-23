import dbConnect from '../../lib/mongodb'
import Purchase from '../../models/Purchase'

export default async function handler(req, res) {
  await dbConnect()
  const { method } = req
  switch (method) {
    case 'GET':
      try {
        const purchases = await Purchase.find({})
        res.status(200).json({ purchases })
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'POST':
      try {
        const purchase = new Purchase(req.body)
        await purchase.save()
        res.status(201).json(purchase)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 