let pendingComment = '';
const modal = document.getElementById('emailModal');
const closeBtn = document.querySelector('.close');
const emailVerificationForm = document.getElementById('emailVerificationForm');
const emailVerificationStatus = document.getElementById('emailVerificationStatus');

// Función auxiliar para convertir array buffer a base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
let currentSlide = 0;
let events = [];

    async function loadEvents() {
        try {
            const response = await fetch('/production/events');
            events = await response.json();
            displayEvents(events);
            setupCarousel();
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

function displayEvents(events) {
    const carouselInner = document.querySelector('.carousel-inner');
    const indicators = document.querySelector('.carousel-indicators');
    
    carouselInner.innerHTML = events.map((event, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="data:${event.image.contentType};base64,${arrayBufferToBase64(event.image.data.data)}" alt="Event">
        </div>
    `).join('');
    
    indicators.innerHTML = events.map((_, index) => `
        <div class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');
}
async function loadMenuItems() {
    try {
      const response = await fetch('/production/menu')
      const items = await response.json()
      displayMenuItems(items)
    } catch (error) {
      console.error('Error loading menu items:', error)
    }
  }
  function displayMenuItems(items) {
    const menuGrid = document.querySelector('.menu-grid');
    menuGrid.innerHTML = items.map(item => `
      <div class="menu-item" id="${item.tipo}">
        <img src="data:${item.foto.contentType};base64,${arrayBufferToBase64(item.foto.data.data)}" alt="${item.nombre}">
        <div class="menu-item-content">
          <h3>${item.nombre}</h3>
          <p>Ingredientes: ${item.ingredientes.join(', ')}</p>
          <span class="price">Precio: $${item.precio}</span><br>
          <button 
                    class="add-to-cart-btn" 
                    onclick="addToCart({
                        _id: '${item._id}',
                        nombre: '${item.nombre}',
                        precio: ${item.precio}
                    })"
                >
                    <i class="fas fa-cart-plus"></i> Agregar al Carrito
                </button>
        </div>
      </div>
    `).join('');
  
    // Mostrar elementos salados por defecto
    filterItems('salado');
  }
  
  function filterItems(type) {
    const allItems = document.querySelectorAll('.menu-item');
    allItems.forEach(item => {
      if (item.id === type) {
        item.style.display = 'grid';
      } else {
        item.style.display = 'none';
      }
    });
  }
  
  // Manejador de clic para los botones de filtro
  document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
  
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Eliminar clase activa de todos los botones
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Agregar clase activa al botón clicado
        e.target.classList.add('active');
        // Filtrar elementos
        filterItems(e.target.id);
      });
    });
  });

function setupCarousel() {
    const carousel = document.querySelector('.carousel-inner');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    const indicators = document.querySelectorAll('.indicator');
    
    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Actualizar indicadores
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }
    
    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + events.length) % events.length;
        updateCarousel();
    });
    
    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % events.length;
        updateCarousel();
    });
    
    indicators.forEach((indicator) => {
        indicator.addEventListener('click', () => {
            currentSlide = parseInt(indicator.dataset.index);
            updateCarousel();
        });
    });
    
    // Auto-avanzar el carrusel
    setInterval(() => {
        currentSlide = (currentSlide + 1) % events.length;
        updateCarousel();
    }, 5000);
}

async function loadCateringItems() {
    try {
      const response = await fetch('/production/catering');
      const cateringItems = await response.json();
      displayCateringItems(cateringItems);
    } catch (error) {
      console.error('Error loading catering items:', error);
    }
  }
  
  function displayCateringItems(items) {
    const cateringSection = document.querySelector('.catering-container');
    cateringSection.innerHTML = items.map(item => `
      <div class="catering-content" style="background-image: url(data:${item.foto.contentType};base64,${arrayBufferToBase64(item.foto.data.data)})">
        <div class="catering-text">
          <h2>${item.nombre}</h2>
          <p>Ingredientes: ${item.descripcion}</p>
          <span class="price">$${item.precio}</span>
        </div>
      </div>
    `).join('');
  }
  

document.addEventListener('DOMContentLoaded', () => {
  loadMenuItems();
  loadCateringItems();
  loadEvents();
  showVerificationMessage();
});

document.getElementById('commentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const content = document.getElementById('commentContent').value.trim();
  if (!content) return;
  
  pendingComment = content;
  modal.style.display = 'block';
});

// Cerrar modal cuando se haga clic en el X
closeBtn.onclick = () => {
  modal.style.display = 'none';
  emailVerificationForm.reset();
  emailVerificationStatus.innerHTML = '';
};

// Cerrar modal cuando se haga clic fuera
window.onclick = (e) => {
  if (e.target === modal) {
      modal.style.display = 'none';
      emailVerificationForm.reset();
      emailVerificationStatus.innerHTML = '';
  }
};
// Manejador de envío del formulario de verificación de correo electrónico
emailVerificationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('commentEmail').value.trim();
  emailVerificationStatus.innerHTML = 'Enviando...';
  
  try {
      const response = await fetch('/comments/add', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
              content: pendingComment, 
              email: email 
          })
      });

      const data = await response.json();
      
      if (response.ok) {
          emailVerificationStatus.className = 'success';
          emailVerificationStatus.innerHTML = data.message;
          document.getElementById('commentForm').reset();
          
          // Cerrar modal después de 3 segundos en éxito
          setTimeout(() => {
              modal.style.display = 'none';
              emailVerificationForm.reset();
              emailVerificationStatus.innerHTML = '';
          }, 3000);
      } else {
          emailVerificationStatus.className = 'error';
          emailVerificationStatus.innerHTML = data.error;
      }
  } catch (error) {
      console.error('Error:', error);
      emailVerificationStatus.className = 'error';
      emailVerificationStatus.innerHTML = 'Error al enviar el comentario';
  }
});

// agregar soporte de teclado para cerrar modal con la tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
      emailVerificationForm.reset();
      emailVerificationStatus.innerHTML = '';
  }
});

// Contador de caracteres
document.getElementById('commentContent').addEventListener('input', function() {
    const charCount = this.value.length
    document.querySelector('.char-counter').textContent = `${charCount}/500`
})
// Funcionalidad del carrito
let cart = [];

function addToCart(item) {
  const existingItem = cart.find(cartItem => cartItem._id === item._id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({...item, quantity: 1});
  }
  
  updateCartUI();
}

function removeFromCart(itemId) {
  cart = cart.filter(item => item._id !== itemId);
  updateCartUI();
}

function updateQuantity(itemId, newQuantity) {
  const item = cart.find(item => item._id === itemId);
  if (item) {
    item.quantity = Math.max(0, newQuantity);
    if (item.quantity === 0) {
      removeFromCart(itemId);
    }
  }
  updateCartUI();
}

function updateCartUI() {
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <h4>${item.nombre}</h4>
        <div class="quantity-controls">
          <button onclick="updateQuantity('${item._id}', ${item.quantity - 1})">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity('${item._id}', ${item.quantity + 1})">+</button>
        </div>
      </div>
      <div>
        <p>$${(item.precio * item.quantity).toFixed(2)}</p>
        <button onclick="removeFromCart('${item._id}')" class="remove-item">×</button>
      </div>
    </div>
  `).join('');
  
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartTotal.textContent = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0).toFixed(2);
}

// Abrir/cerrar carrito
document.getElementById('cartBtn').addEventListener('click', () => {
  document.getElementById('cart').classList.add('open');
});

document.getElementById('closeCart').addEventListener('click', () => {
  document.getElementById('cart').classList.remove('open');
});

// Manejador de pago
document.getElementById('checkoutBtn').addEventListener('click', async () => {
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    // Guardar carrito en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Redirigir a la página de pago
    window.location.href = '/checkout.html';
});
// Función para manejar mensajes de verificación
function showVerificationMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('verificationStatus');
  
  if (!status) return;

  const alert = document.getElementById('verificationAlert');
  const message = alert.querySelector('.alert-message');
  
  let messageText = '';
  let messageType = '';
  
  switch(status) {
      case 'success':
          messageText = '¡Comentario verificado exitosamente!';
          messageType = 'success';
          break;
      case 'invalid':
          messageText = 'El enlace de verificación es inválido o ha expirado.';
          messageType = 'error';
          break;
      case 'error':
          messageText = 'Ocurrió un error al verificar el comentario. Por favor intenta nuevamente.';
          messageType = 'error';
          break;
  }
  
  if (messageText) {
      message.textContent = messageText;
      alert.className = `alert alert-${messageType}`;
      alert.style.display = 'block';
      
      // Eliminar estado de verificación de URL sin recargar
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Ocultar automáticamente después de 5 segundos
      setTimeout(() => {
          alert.style.animation = 'fadeOut 0.5s ease-out';
          setTimeout(() => {
              alert.style.display = 'none';
              alert.style.animation = '';
          }, 500);
      }, 5000);
  }
}

// Función de cierre del botón
document.querySelector('.alert-close').addEventListener('click', function() {
  const alert = document.getElementById('verificationAlert');
  alert.style.animation = 'fadeOut 0.5s ease-out';
  setTimeout(() => {
      alert.style.display = 'none';
      alert.style.animation = '';
  }, 500);
});