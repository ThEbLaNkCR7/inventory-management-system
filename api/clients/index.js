import dbConnect from '../../lib/mongodb'
import Client from '../../models/Client'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

export default async function handler(req, res) {
  await dbConnect()
  const { method } = req
  switch (method) {
    case 'GET':
      try {
        const clients = await Client.find({})
        res.status(200).json({ clients })
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'POST':
      try {
        const client = new Client(req.body)
        await client.save()
        res.status(201).json(client)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 