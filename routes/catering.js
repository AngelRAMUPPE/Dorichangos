import express from 'express'
import Catering from '../models/catering.js'
import { requireAuth } from '../middleware/auth.js'
import multer from 'multer'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Obtener todos los elementos de catering
router.get('/', async (req, res) => {
    try {
        const cateringItems = await Catering.find();
        res.json(cateringItems);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching catering items' });
    }
});

// Eliminar elemento de catering
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const result = await Catering.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting catering item:', error);
        res.status(500).json({ error: 'Error deleting catering item' });
    }
});

// Actualizar elemento de catering
router.put('/:id', requireAuth, upload.single('foto'), async (req, res) => {
    try {
        const { nombre, descripcion, precio } = req.body;
        
        const updateData = {
            nombre,
            descripcion,
            precio
        };

        if (req.file) {
            updateData.foto = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        const updatedItem = await Catering.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating catering item:', error);
        res.status(500).json({ error: 'Error updating catering item' });
    }
});

// Agregar nuevo elemento de catering
router.post('/add', requireAuth, upload.single('foto'), async (req, res) => {
    try {
        const { nombre, descripcion, precio } = req.body;
        
        const newItem = new Catering({
            nombre,
            descripcion,
            precio,
            foto: req.file ? {
                data: req.file.buffer,
                contentType: req.file.mimetype
            } : null
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error creating catering item:', error);
        res.status(500).json({ error: 'Error creating catering item' });
    }
});

export default router