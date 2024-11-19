import express from 'express'
import mongoose from 'mongoose'
import { requireAdmin } from '../middleware/auth.js'
import Menu from '../models/Menu.js'
import Event from '../models/Event.js'
import Catering from '../models/catering.js'
import Comment from '../models/Comment.js'
import User from '../models/User.js'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ruta del panel de control
router.get('/', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'))
})
router.post('/publish-changes', requireAdmin, async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Conectar a la base de datos de producción
    const prodConnection = await mongoose.createConnection('mongodb+srv://angel:Dorichangos123@bddorichangos.0fxtv.mongodb.net/ProductionDB')

    // Eliminar colecciones existentes en producción
    await prodConnection.dropDatabase()

    // Obtener todos los datos de las colecciones de staging
    const menuItems = await Menu.find({}).lean()
    const events = await Event.find({}).lean()
    const cateringItems = await Catering.find({}).lean()

    // Crear colecciones en producción
    const ProdMenu = prodConnection.model('Menu', Menu.schema)
    const ProdEvent = prodConnection.model('Event', Event.schema)
    const ProdCatering = prodConnection.model('Catering', Catering.schema)

    // Insertar datos en producción
    if (menuItems.length) await ProdMenu.insertMany(menuItems)
    if (events.length) await ProdEvent.insertMany(events)
    if (cateringItems.length) await ProdCatering.insertMany(cateringItems)

    await session.commitTransaction()
    await prodConnection.close()

    res.json({ success: true, message: 'Changes published successfully' })
  } catch (error) {
    await session.abortTransaction()
    console.error('Error publishing changes:', error)
    res.status(500).json({ error: 'Failed to publish changes' })
  } finally {
    session.endSession()
  }
})

router.get('/comments/pending', requireAdmin, async (req, res) => {
  try {
      const comments = await Comment.find({ status: 'pending' }).sort({ createdAt: -1 });
      res.json(comments);
  } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Error fetching comments' });
  }
});

router.put('/comments/:id', requireAdmin, async (req, res) => {
  try {
      const { id } = req.params;
      const { status } = req.body;
      
      const comment = await Comment.findByIdAndUpdate(
          id, 
          { status }, 
          { new: true }
      );
      
      res.json(comment);
  } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({ error: 'Error updating comment' });
  }
});
router.post('/users/add', requireAdmin, async (req, res) => {
  try {
      const { username, password, role } = req.body;
      
      // Comprobar si el nombre de usuario ya existe
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(400).json({ error: 'El nombre de usuario ya existe' });
      }

      // Crear nuevo usuario
      const user = new User({
          username,
          password, // Será hasheado por el middleware pre-save
          role
      });

      await user.save();
      res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

export default router 