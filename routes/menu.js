import express from 'express'
import multer from 'multer'
import Menu from '../models/Menu.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Configurar multer para almacenamiento en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Agregar nuevo elemento al menú
router.post('/add', requireAuth, upload.single('foto'), async (req, res) => {
  try {
    const { nombre, precio, ingredientes, tipo } = req.body
    
    const menuItem = new Menu({
      nombre,
      precio: parseFloat(precio),
      ingredientes: ingredientes.split(',').map(item => item.trim()),
      tipo,
      foto: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    })

    await menuItem.save()
    res.redirect('/admin/menu?message=item_added')
  } catch (error) {
    console.error('Error adding menu item:', error)
    res.redirect('/admin/menu?error=add_failed')
  }
})

// Obtener todos los elementos del menú
router.get('/', async (req, res) => {
  try {
    const menuItems = await Menu.find()
    res.json(menuItems)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching menu items' })
  }
})

// Eliminar elemento del menú
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await Menu.findByIdAndDelete(req.params.id)
    if (!result) {
      return res.status(404).json({ error: 'Item not found' })
    }
    res.json({ success: true, message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    res.status(500).json({ error: 'Error deleting menu item' })
  }
})

// Actualizar elemento del menú
router.put('/:id', requireAuth, upload.single('foto'), async (req, res) => {
    try {
        const { nombre, ingredientes, precio, tipo } = req.body;
        
        const updateData = {
            nombre,
            ingredientes: ingredientes.split(',').map(i => i.trim()),
            precio,
            tipo
        };

        // Si se ha subido una nueva foto, agregarla a los datos de actualización
        if (req.file) {
            updateData.foto = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        const updatedItem = await Menu.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true } // Esta opción devuelve el documento actualizado
        );

        if (!updatedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Error updating menu item' });
    }
});

export default router 