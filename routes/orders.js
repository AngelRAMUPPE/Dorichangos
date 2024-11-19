import express from 'express';
import Order from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Crear una nueva orden
router.post('/create', async (req, res) => {
    try {
        const { items, total, name, phone, email, address, paymentMethod } = req.body;

        // Validar campos requeridos
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items are required' });
        }

        if (!total || total <= 0) {
            return res.status(400).json({ error: 'Valid total is required' });
        }

        if (!name || !phone || !email || !address) {
            return res.status(400).json({ error: 'Customer details are required' });
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
            message: 'Order created successfully',
            orderId: order._id
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Error creating order' });
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
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

// Actualizar el estado de la orden (ruta protegida para admin)
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
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Error updating order status' });
    }
});

// Obtener orden por ID (ruta pública para confirmación de orden)
router.get('/:orderId', async (req, res) => {
    try {
        console.log('Fetching order:', req.params.orderId);
        
        if (!req.params.orderId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid order ID format' });
        }

        const order = await Order.findById(req.params.orderId)
            .populate('items.menuItem');

        console.log('Order found:', order);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ 
            error: 'Error fetching order details',
            details: error.message 
        });
    }
});

export default router; 