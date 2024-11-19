import env from '../config/env.js'
// Recuperar datos del carrito desde localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Renderizar elementos del carrito
function renderCheckoutItems() {
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <div>
                <h4>${item.nombre}</h4>
                <p>Cantidad: ${item.quantity}</p>
            </div>
            <div>
                <p>$${(item.precio * item.quantity).toFixed(2)}</p>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    checkoutTotal.textContent = total.toFixed(2);
}

let stripe;
let elements;


// Inicializar Stripe
async function initializeStripe() {
    stripe = Stripe(env.stripe.publishableKey); // Reemplazar con tu clave pública de Stripe
    elements = stripe.elements();
    
    const cardElement = elements.create('card');
    cardElement.mount('#card-element');

    // Manejador de errores de validación en tiempo real
    cardElement.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
}

function togglePaymentMethod() {
    const cardSection = document.getElementById('card-payment-section');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    cardSection.style.display = paymentMethod === 'card' ? 'block' : 'none';
}

async function processCardPayment(formData) {
    const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    
    try {
        // Crear intención de pago
        const intentResponse = await fetch('/payments/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: total })
        });
        
        const { clientSecret } = await intentResponse.json();

        // Confirmar pago con tarjeta
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement('card'),
                billing_details: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                }
            }
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

        // Pago exitoso, crear orden
        return await createOrder({
            ...formData,
            paymentIntentId: result.paymentIntent.id,
            paid: true
        });

    } catch (error) {
        throw new Error(error.message);
    }
}

async function createOrder(orderData) {
    const response = await fetch('/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error creating order');
    }

    return response.json();
}

// Manejar envío de formulario
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.classList.add('processing');

    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        items: cart.map(item => ({
            menuItem: item._id,
            quantity: item.quantity,
            price: item.precio
        })),
        total: cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0)
    };

    try {
        let orderResult;

        if (formData.paymentMethod === 'card') {
            orderResult = await processCardPayment(formData);
        } else {
            orderResult = await createOrder(formData);
        }

        // Limpiar carrito y redirigir
        localStorage.removeItem('cart');
        window.location.href = `/order-confirmation.html?orderId=${orderResult.orderId}`;

    } catch (error) {
        alert(error.message || 'Error processing order');
    } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('processing');
    }
});

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    initializeStripe();
    renderCheckoutItems();
    togglePaymentMethod();
});