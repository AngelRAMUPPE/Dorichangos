async function loadOrderDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (!orderId) {
        console.error('No se proporcionó ID de orden');
        showError('No se proporcionó ID de orden');
        return;
    }

    try {
        const response = await fetch(`/orders/${orderId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al cargar el pedido');
        }

        displayOrderDetails(data);
    } catch (error) {
        console.error('Error al cargar el pedido:', error);
        showError('Error al cargar los detalles del pedido');
    }
}

function showError(message) {
    const container = document.querySelector('.confirmation-card');
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <h2>Lo sentimos</h2>
            <p>${message}</p>
            <a href="/" class="button">Volver al Inicio</a>
        </div>
    `;
}

function displayOrderDetails(order) {
    try {
        // Establecer ID de orden
        document.getElementById('orderId').textContent = order._id;

        // Establecer estado
        const statusText = {
            'pending': 'Pendiente de Pago',
            'paid': 'Pagado',
            'preparing': 'En Preparación',
            'completed': 'Completado'
        };

        document.getElementById('orderStatus').innerHTML = `
            <span class="status-badge status-${order.status}">
                ${statusText[order.status] || order.status}
            </span>
        `;

        // Establecer elementos
        const itemsHtml = order.items.map(item => `
            <div class="order-item">
                <div>
                    <h4>${item.menuItem?.nombre || 'Producto no disponible'}</h4>
                    <p>Cantidad: ${item.quantity}</p>
                </div>
                <div>$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');
        
        document.getElementById('orderItems').innerHTML = itemsHtml;

        // Establecer total
        document.getElementById('orderTotal').textContent = order.total.toFixed(2);

        // Establecer información del cliente
        document.getElementById('customerInfo').innerHTML = `
            <h3>Información de Entrega</h3>
            <p><strong>Nombre:</strong> ${order.customerName || 'N/A'}</p>
            <p><strong>Teléfono:</strong> ${order.customerPhone || 'N/A'}</p>
            <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
            <p><strong>Dirección:</strong> ${order.deliveryAddress || 'N/A'}</p>
            <p><strong>Método de Pago:</strong> ${
                order.paymentMethod === 'card' ? 'Tarjeta de Crédito' : 'Efectivo'
            }</p>
        `;
    } catch (error) {
        console.error('Error displaying order details:', error);
        showError('Error al mostrar los detalles del pedido');
    }
}

// Agregar estilos para el mensaje de error
const styles = `
    .error-message {
        text-align: center;
        padding: 20px;
    }

    .error-message i {
        font-size: 48px;
        color: #dc3545;
        margin-bottom: 20px;
    }

    .error-message h2 {
        color: #dc3545;
        margin-bottom: 10px;
    }

    .error-message p {
        margin-bottom: 20px;
        color: #666;
    }
`;

// Agregar estilos al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Cargar detalles de la orden cuando se carga la página
document.addEventListener('DOMContentLoaded', loadOrderDetails);