import express from 'express'
import multer from 'multer'
import Event from '../models/Event.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Obtener todos los eventos
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 })
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' })
  }
})
// Obtener eventos activos
router.get('/active', async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ createdAt: -1 })
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching active events' })
  }
})

// Subir nueva imagen de evento
router.post('/upload', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' })
    }

    const newEvent = new Event({
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    })

    await newEvent.save()
    res.status(201).json(newEvent)
  } catch (error) {
    res.status(500).json({ error: 'Error uploading event image' })
  }
})

// Actualizar estado de evento (activo/inactivo)
router.put('/status', requireAuth, async (req, res) => {
  try {
    const { events } = req.body
    
    // Resetear todos los eventos a inactivo
    await Event.updateMany({}, { isActive: false })
    
    // Setear eventos seleccionados como activos
    if (events && events.length) {
      await Event.updateMany(
        { _id: { $in: events } },
        { isActive: true }
      )
    }
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Error updating event status' })
  }
})

// Eliminar evento
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Error deleting event' })
  }
})

export default router 