import dbConnect from '../../lib/mongodb'
import Sale from '../../models/Sale'

export default async function handler(req, res) {
  await dbConnect()
  const { method } = req
  switch (method) {
    case 'GET':
      try {
        const sales = await Sale.find({})
        res.status(200).json({ sales })
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'POST':
      try {
        const sale = new Sale(req.body)
        await sale.save()
        res.status(201).json(sale)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 