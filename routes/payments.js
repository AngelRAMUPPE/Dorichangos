import express from 'express';
import Stripe from 'stripe';
import env from '../config/env.js';


const router = express.Router();
const stripe = new Stripe(env.stripe.secretKey);

router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), 
            currency: 'mxn', 
            metadata: {
                integration_check: 'accept_a_payment'
            }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Error processing payment' });
    }
});

export default router; 