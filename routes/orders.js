import express from 'express';
import Order from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';
import nodemailer from 'nodemailer';
import env from '../config/env.js'

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.email.user, 
      pass: env.email.pass
    }
  });
  
  // Modify the update status route
  router.patch('/:orderId/status', async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
  
      if (!['pending', 'paid', 'preparing', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
  
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      ).populate('items.menuItem');
  
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      // Send email notification when order is completed
      if (status === 'completed') {
        const mailOptions = {
          from: env.email.user,
          to: order.customerEmail,
          subject: '¡Tu orden está lista para recoger!',
          html: `
            <h1>¡Tu orden está lista!</h1>
            <p>Hola ${order.customerName},</p>
            <p>Tu orden #${order._id.slice(-6)} está lista para recoger.</p>
            <h2>Detalles de la orden:</h2>
            <ul>
              ${order.items.map(item => `
                <li>${item.quantity}x ${item.menuItem.nombre} - $${(item.price * item.quantity).toFixed(2)}</li>
              `).join('')}
            </ul>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            <p>¡Gracias por tu preferencia!</p>
          `
        };
  
        await transporter.sendMail(mailOptions);
      }
  
      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Error updating order status' });
    }
  });


// Crear una nueva orden
router.post('/create', async (req, res) => {
    try {
        const { items, total, name, phone, email, address, paymentMethod } = req.body;

        // Validar campos requeridos
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Se requieren elementos' });
        }

        if (!total || total <= 0) {
            return res.status(400).json({ error: 'Se requiere un total válido' });
        }

        if (!name || !phone || !email || !address) {
            return res.status(400).json({ error: 'Se requieren los detalles del cliente' });
        }

        // Crear nueva orden
        const order = new Order({
            items,
            total,
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            deliveryAddress: address,
            paymentMethod,
            status: paymentMethod === 'card' ? 'paid' : 'pending'
        });

        await order.save();

        res.status(201).json({
            message: 'Pedido creado exitosamente',
            orderId: order._id
        });

    } catch (error) {
        console.error('Error creando el pedido:', error);
        res.status(500).json({ error: 'Error creando el pedido' });
    }
});

// Obtener todas las órdenes (ruta protegida para admin)
router.get('/', requireAuth, async (req, res) => {
    try {
        // Obtener órdenes de las últimas 24 horas para las completadas
        // Obtener todas las órdenes no completadas sin importar el tiempo
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const orders = await Order.find({
            $or: [
                { status: { $ne: 'completed' } },
                {
                    status: 'completed',
                    createdAt: { $gte: oneDayAgo }
                }
            ]
        })
        .sort({ createdAt: -1 })
        .populate('items.menuItem');

        res.json(orders);
    } catch (error) {
        console.error('Error obteniendo los pedidos:', error);
        res.status(500).json({ error: 'Error obteniendo los pedidos' });
    }
});

// Actualizar el estado de la orden (ruta protegida para admin)
router.patch('/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!['pending', 'paid', 'preparing', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error actualizando el estado del pedido:', error);
        res.status(500).json({ error: 'Error actualizando el estado del pedido' });
    }
});

// Obtener orden por ID (ruta pública para confirmación de orden)
router.get('/:orderId', async (req, res) => {
    try {
        console.log('Obteniendo pedido:', req.params.orderId);
        
        if (!req.params.orderId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Formato de ID de pedido inválido' });
        }

        const order = await Order.findById(req.params.orderId)
            .populate('items.menuItem');

        console.log('Pedido encontrado:', order);

        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error obteniendo los detalles del pedido:', error);
        res.status(500).json({ 
            error: 'Error obteniendo los detalles del pedido',
            details: error.message 
        });
    }
});

export default router; 