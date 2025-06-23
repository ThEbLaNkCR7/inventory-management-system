import dbConnect from '../../../lib/mongodb'
import Client from '../../../models/Client'

export default async function handler(req, res) {
  await dbConnect()
  const { method } = req
  const { id } = req.query
  switch (method) {
    case 'GET':
      try {
        const client = await Client.findById(id)
        if (!client) return res.status(404).json({ message: 'Client not found' })
        res.status(200).json(client)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'PUT':
      try {
        const client = await Client.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        if (!client) return res.status(404).json({ message: 'Client not found' })
        res.status(200).json(client)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'DELETE':
      try {
        const client = await Client.findByIdAndDelete(id)
        if (!client) return res.status(404).json({ message: 'Client not found' })
        res.status(200).json({ message: 'Client deleted successfully' })
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 