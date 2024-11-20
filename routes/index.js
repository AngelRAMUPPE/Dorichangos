import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { ProdMenu, ProdEvent, ProdCatering } from '../config/productionDatabase.js'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

router.get('/production/menu', async (req, res) => {
  try {
    const menuItems = await ProdMenu.find()
    res.json(menuItems)
  } catch (error) {
    console.error('Error fetching production menu items:', error)
    res.status(500).json({ error: 'Error fetching menu items' })
  }
})

router.get('/production/catering', async (req, res) => {
  try {
    const cateringItems = await ProdCatering.find()
    res.json(cateringItems)
  } catch (error) {
    console.error('Error fetching production catering items:', error)
    res.status(500).json({ error: 'Error fetching catering items' })
  }
})

router.get('/production/events', async (req, res) => {
  try {
    const events = await ProdEvent.find({ isActive: true })
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching active events' })
  }
})



export default router 