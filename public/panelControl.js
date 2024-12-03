// Funcionalidad de modal
const modal = document.getElementById('menuModal');
const addMenuBtn = document.getElementById('addMenuBtn');
const addMenuBtn2 = document.getElementById('addMenuBtn2');
const closeBtn = document.getElementsByClassName('close')[0];
const menuForm = document.getElementById('menuForm');

// Abrir modal
addMenuBtn.onclick = () => modal.style.display = 'block';
addMenuBtn2.onclick = () => modal.style.display = 'block';
// Cerrar modal
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => {
    if (e.target == modal) modal.style.display = 'none';
}

// Vista previa de imagen
document.getElementById('foto').addEventListener('change', function(e) {
    const preview = document.getElementById('preview');
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    }

    if (file) {
        reader.readAsDataURL(file);
    }
});

let menuItems = []; // Almacenar todos los elementos del menú

// Cargar y mostrar elementos del menú
async function loadMenuItems() {
    try {
        const response = await fetch('/menu');
        menuItems = await response.json(); // Almacenar elementos globalmente
        displayMenuItems('salado'); // Mostrar todos los elementos inicialmente
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}

// Mostrar elementos del menú basado en el filtro
function displayMenuItems(filterType) {
    const menuContainer = document.getElementById('menuItemsContainer');
    const filteredItems = filterType === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.tipo === filterType);
    
    menuContainer.innerHTML = filteredItems.map(item => `
        <div class="menu-item" data-type="${item.tipo}">
            <img src="data:${item.foto.contentType};base64,${arrayBufferToBase64(item.foto.data.data)}" alt="${item.nombre}">
            <div class="item-details">
                <h3>${item.nombre}</h3>
                <p>${item.ingredientes.join(', ')}</p>
                <span class="price">Precio: $${item.precio}</span>
            </div>
            <div class="item-actions">
                <button class="btn btn-danger" onclick="deleteMenuItem('${item._id}')">Eliminar</button>
                <button class="btn btn-success" onclick="editMenuItem('${item._id}')">Modificar</button>
            </div>
        </div>
    `).join('');
}

// Manejador de clic para los botones de filtro
document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();

    // Agregar manejadores de clic a los botones de filtro
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Actualizar botón activo
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filtrar elementos
            const filterType = button.getAttribute('data-type');
            displayMenuItems(filterType);
        });
    });
});

// Función auxiliar para convertir array buffer a base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Actualizar envío del formulario para refrescar la visualización
menuForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(menuForm);

    try {
        const response = await fetch('/menu/add', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Producto agregado exitosamente');
            modal.style.display = 'none';
            menuForm.reset();
            document.getElementById('preview').innerHTML = '';
            await loadMenuItems(); // Recargar todos los elementos
            // Mantener el filtro actual
            const activeFilter = document.querySelector('.filter-btn.active');
            displayMenuItems(activeFilter.getAttribute('data-type'));
        } else {
            alert('Error al agregar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar el producto');
    }
});

// Agregar estas nuevas funciones y manejadores de eventos
const deleteModal = document.getElementById('deleteModal');
let itemToDelete = null;

// Función para eliminar elemento del menú
async function deleteMenuItem(itemId) {
    itemToDelete = itemId;
    deleteModal.style.display = 'block';
}

// Manejador de confirmación de eliminación
document.getElementById('confirmDelete').addEventListener('click', async () => {
    if (!itemToDelete) return;
    
    try {
        const response = await fetch(`/menu/${itemToDelete}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Eliminar elemento de la matriz local y actualizar la visualización
            menuItems = menuItems.filter(item => item._id !== itemToDelete);
            const activeFilter = document.querySelector('.filter-btn.active');
            displayMenuItems(activeFilter.getAttribute('data-type'));
            alert('Elemento eliminado exitosamente');
        } else {
            alert('Error al eliminar el elemento');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el elemento');
    }

    // Cerrar modal y restablecer itemToDelete
    deleteModal.style.display = 'none';
    itemToDelete = null;
});

// Manejador de cancelación de eliminación
document.getElementById('cancelDelete').addEventListener('click', () => {
    deleteModal.style.display = 'none';
    itemToDelete = null;
});

// Cerrar modal de eliminación al hacer clic fuera
window.onclick = (e) => {
    if (e.target == deleteModal) {
                deleteModal.style.display = 'none';
                itemToDelete = null;
            }
        }
// Agregar estas nuevas funciones para la funcionalidad de edición
 let currentEditItem = null;

 async function editMenuItem(itemId) {
     // Encontrar el elemento en nuestra matriz menuItems
     currentEditItem = menuItems.find(item => item._id === itemId);
     if (!currentEditItem) return;

     // Rellenar el formulario con los valores actuales
     document.getElementById('editNombre').value = currentEditItem.nombre;
     document.getElementById('editIngredientes').value = Array.isArray(currentEditItem.ingredientes) 
         ? currentEditItem.ingredientes.join(', ') 
         : currentEditItem.ingredientes;
     document.getElementById('editPrecio').value = currentEditItem.precio;
     document.getElementById('editTipo').value = currentEditItem.tipo;

     // Mostrar el modal
     document.getElementById('editModal').style.display = 'block';
 }

 // Manejador de envío del formulario
 document.getElementById('editMenuForm').addEventListener('submit', async (e) => {
     e.preventDefault();
     
     if (!currentEditItem) return;

     const formData = new FormData();
     formData.append('nombre', document.getElementById('editNombre').value);
     formData.append('ingredientes', document.getElementById('editIngredientes').value);
     formData.append('precio', document.getElementById('editPrecio').value);
     formData.append('tipo', document.getElementById('editTipo').value);

     const fileInput = document.getElementById('editFoto');
     if (fileInput.files.length > 0) {
         formData.append('foto', fileInput.files[0]);
     }

     try {
         const response = await fetch(`/menu/${currentEditItem._id}`, {
             method: 'PUT',
             body: formData
         });

         if (response.ok) {
             const updatedItem = await response.json();
             // Actualizar el elemento en nuestra matriz local
             const index = menuItems.findIndex(item => item._id === currentEditItem._id);
             if (index !== -1) {
                 menuItems[index] = updatedItem;
             }
             
             // Actualizar la visualización
             const activeFilter = document.querySelector('.filter-btn.active');
             displayMenuItems(activeFilter.getAttribute('data-type'));
             
             alert('Elemento actualizado exitosamente');
             document.getElementById('editModal').style.display = 'none';
         } else {
             alert('Error al actualizar el elemento');
         }
     } catch (error) {
         console.error('Error:', error);
         alert('Error al actualizar el elemento');
     }
 });

 // Manejador de cancelación de edición
 document.getElementById('cancelEdit').addEventListener('click', () => {
     document.getElementById('editModal').style.display = 'none';
     currentEditItem = null;
 });

 // Actualizar manejador de clic de ventana para incluir el modal de edición
 window.onclick = (e) => {
     if (e.target == document.getElementById('deleteModal')) {
         document.getElementById('deleteModal').style.display = 'none';
         itemToDelete = null;
     }
     if (e.target == document.getElementById('editModal')) {
         document.getElementById('editModal').style.display = 'none';
         currentEditItem = null;
     }
 }
 // Manejador de carga de archivos
 document.getElementById('event-image').addEventListener('change', async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        const data = await response.json()
        if (data.success) {
            // Actualizar la interfaz de usuario con la nueva imagen
            console.log('Archivo cargado:', data.path)
        }
    } catch (error) {
        console.error('Upload failed:', error)
    }
})

// Manejador de guardado de eventos
async function saveEvents() {
    try {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Agregar datos del evento
            })
        })
        const data = await response.json()
        if (data.success) {
            alert('Eventos guardados exitosamente')
        }
    } catch (error) {
        console.error('Save failed:', error)
    }
}

// Manejador de filtro de pestañas
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelector('.filter-tab.active').classList.remove('active')
        tab.classList.add('active')
    })
})
// Agregar estas nuevas funciones para crear elementos de catering
document.getElementById('addCateringBtn').addEventListener('click', () => {
    document.getElementById('newCateringModal').style.display = 'block';
    document.getElementById('newCateringForm').reset();
});

document.getElementById('cancelNewCatering').addEventListener('click', () => {
    document.getElementById('newCateringModal').style.display = 'none';
});

document.getElementById('newCateringForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('nombre', document.getElementById('newCateringNombre').value);
    formData.append('descripcion', document.getElementById('newCateringDescripcion').value);
    formData.append('precio', document.getElementById('newCateringPrecio').value);
    
    const fileInput = document.getElementById('newCateringFoto');
    if (fileInput.files.length > 0) {
        formData.append('foto', fileInput.files[0]);
    }

    try {
        const response = await fetch('/catering/add', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const newItem = await response.json();
            cateringItems.push(newItem);
            displayCateringItems();
            document.getElementById('newCateringModal').style.display = 'none';
            alert('Item de catering creado exitosamente');
        } else {
            alert('Error al crear el item');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear el item');
    }
});

// Actualizar manejador de clic de ventana para incluir el modal de nuevo catering
window.onclick = (e) => {
    if (e.target == document.getElementById('deleteCateringModal')) {
        document.getElementById('deleteCateringModal').style.display = 'none';
        cateringItemToDelete = null;
    }
    if (e.target == document.getElementById('editCateringModal')) {
        document.getElementById('editCateringModal').style.display = 'none';
        currentEditCateringItem = null;
    }
    if (e.target == document.getElementById('newCateringModal')) {
        document.getElementById('newCateringModal').style.display = 'none';
    }
}
// Agregar estas variables y funciones para catering
let cateringItems = [];
let currentEditCateringItem = null;
let cateringItemToDelete = null;

// Cargar elementos de catering
async function loadCateringItems() {
    try {
        const response = await fetch('/catering');
        cateringItems = await response.json();
        displayCateringItems();
    } catch (error) {
        console.error('Error loading catering items:', error);
    }
}

// Mostrar elementos de catering
function displayCateringItems() {
    const container = document.getElementById('cateringContainer');
    
    const itemsHTML = cateringItems.map(item => `
        <div class="menu-item">
            <img src="${item.foto ? `data:${item.foto.contentType};base64,${arrayBufferToBase64(item.foto.data.data)}` : ''}" alt="${item.nombre}">
            <div class="item-details">
                <h3>${item.nombre}</h3>
                <p>${item.descripcion}</p>
                <span class="price">Precio: $${item.precio}</span>
            </div>
            <div class="item-actions">
                <button class="btn btn-danger" onclick="deleteCateringItem('${item._id}')">Eliminar</button>
                <button class="btn btn-success" onclick="editCateringItem('${item._id}')">Modificar</button>
            </div>
        </div>
    `).join('');

    container.innerHTML = itemsHTML;
}

// Editar elemento de catering
async function editCateringItem(itemId) {
    currentEditCateringItem = cateringItems.find(item => item._id === itemId);
    if (!currentEditCateringItem) return;

    document.getElementById('editCateringNombre').value = currentEditCateringItem.nombre;
    document.getElementById('editCateringDescripcion').value = currentEditCateringItem.descripcion;
    document.getElementById('editCateringPrecio').value = currentEditCateringItem.precio;

    document.getElementById('editCateringModal').style.display = 'block';
}

// Manejador de envío del formulario de edición de catering
document.getElementById('editCateringForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentEditCateringItem) return;

    const formData = new FormData();
    formData.append('nombre', document.getElementById('editCateringNombre').value);
    formData.append('descripcion', document.getElementById('editCateringDescripcion').value);
    formData.append('precio', document.getElementById('editCateringPrecio').value);

    const fileInput = document.getElementById('editCateringFoto');
    if (fileInput.files.length > 0) {
        formData.append('foto', fileInput.files[0]);
    }

    try {
        const response = await fetch(`/catering/${currentEditCateringItem._id}`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            const updatedItem = await response.json();
            const index = cateringItems.findIndex(item => item._id === currentEditCateringItem._id);
            if (index !== -1) {
                cateringItems[index] = updatedItem;
            }
            displayCateringItems();
            alert('Elemento actualizado exitosamente');
            document.getElementById('editCateringModal').style.display = 'none';
        } else {
            alert('Error al actualizar el elemento');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el elemento');
    }
});

// Eliminar elemento de catering
async function deleteCateringItem(itemId) {
    cateringItemToDelete = itemId;
    document.getElementById('deleteCateringModal').style.display = 'block';
}

// Manejador de confirmación de eliminación
document.getElementById('confirmCateringDelete').addEventListener('click', async () => {
    if (!cateringItemToDelete) return;
    
    try {
        const response = await fetch(`/catering/${cateringItemToDelete}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            cateringItems = cateringItems.filter(item => item._id !== cateringItemToDelete);
            displayCateringItems();
            alert('Elemento eliminado exitosamente');
        } else {
            alert('Error al eliminar el elemento');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el elemento');
    }

    document.getElementById('deleteCateringModal').style.display = 'none';
    cateringItemToDelete = null;
});

// Botones de cancelación de modal
document.getElementById('cancelCateringEdit').addEventListener('click', () => {
    document.getElementById('editCateringModal').style.display = 'none';
    currentEditCateringItem = null;
});

document.getElementById('cancelCateringDelete').addEventListener('click', () => {
    document.getElementById('deleteCateringModal').style.display = 'none';
    cateringItemToDelete = null;
});

// Actualizar manejador de clic de ventana para incluir los modales de catering
window.onclick = (e) => {
    if (e.target == document.getElementById('deleteCateringModal')) {
        document.getElementById('deleteCateringModal').style.display = 'none';
        cateringItemToDelete = null;
    }
    if (e.target == document.getElementById('editCateringModal')) {
        document.getElementById('editCateringModal').style.display = 'none';
        currentEditCateringItem = null;
    }
}

// Cargar elementos de catering cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    loadCateringItems();
});

// Funciones de manejo de eventos
async function loadEvents() {
  try {
    const response = await fetch('/events')
    const events = await response.json()
    displayEvents(events)
  } catch (error) {
    console.error('Error loading events:', error)
  }
}

function displayEvents(events) {
  const eventsGrid = document.querySelector('.events-grid')
  eventsGrid.innerHTML = events.map(event => `
    <div class="event-card" data-id="${event._id}">
      <div class="image-container">
        <img src="data:${event.image.contentType};base64,${arrayBufferToBase64(event.image.data.data)}" alt="Event">
        <input type="checkbox" class="image-selector" ${event.isActive ? 'checked' : ''}>
        <button class="remove-event" onclick="confirmDelete('${event._id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('')
}
// Agregar estas nuevas funciones
function confirmDelete(eventId) {
    const modal = document.getElementById('deleteModal')
    modal.style.display = 'block'
    
    // Almacenar el ID del evento en el botón de confirmación del modal
    document.getElementById('confirmDelete').dataset.eventId = eventId
  }
  
  async function deleteEvent(eventId) {
    try {
      const response = await fetch(`/events/${eventId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Cerrar modal y recargar eventos
        document.getElementById('deleteModal').style.display = 'none'
        await loadEvents()
      } else {
        alert('Error deleting event')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Error deleting event')
    }
  }
  
  // Agregar manejadores de eventos cuando se carga la página
  document.addEventListener('DOMContentLoaded', () => {
    loadEvents()
    
    // Botón de cierre de modal
    document.querySelector('.close-modal').addEventListener('click', () => {
      document.getElementById('deleteModal').style.display = 'none'
    })
    
    // Botón de confirmación de eliminación
    document.getElementById('confirmDelete').addEventListener('click', function() {
      const eventId = this.dataset.eventId
      deleteEvent(eventId)
    })
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
      const modal = document.getElementById('deleteModal')
      if (e.target === modal) {
        modal.style.display = 'none'
      }
    })
  })
// Manejador de carga de imagen de evento
document.getElementById('event-image').addEventListener('change', async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await fetch('/events/upload', {
      method: 'POST',
      body: formData
    })
    
    if (response.ok) {
      await loadEvents()
    } else {
      alert('Error uploading image')
    }
  } catch (error) {
    console.error('Upload failed:', error)
    alert('Error uploading image')
  }
})

// Manejador de guardado de selecciones de eventos
async function saveEvents() {
  const selectedEvents = Array.from(document.querySelectorAll('.image-selector:checked'))
    .map(checkbox => checkbox.closest('.event-card').dataset.id)

  try {
    const response = await fetch('/events/status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ events: selectedEvents })
    })

    if (response.ok) {
      alert('Events saved successfully')
    } else {
      alert('Error saving events')
    }
  } catch (error) {
    console.error('Save failed:', error)
    alert('Error saving events')
  }
}

// Cargar eventos cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  loadEvents()
  loadOrders();
})

async function loadOrders() {
    try {
        const response = await fetch('/orders');
        const orders = await response.json();
        
        // Filtrar pedidos completados más antiguos que 30 minutos
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const filteredOrders = orders.filter(order => {
            if (order.status === 'completed') {
                return new Date(order.createdAt) > thirtyMinutesAgo;
            }
            return true;
        });
        
        const ordersContainer = document.getElementById('ordersContainer');
        ordersContainer.innerHTML = `
            <div class="orders-header">
                <h2>Pedidos en Cocina</h2>
            </div>
            <div class="kitchen-orders">
                <div class="orders-column">
                    <h3>Pedidos Nuevos</h3>
                    ${renderOrdersByStatus(filteredOrders, ['paid'])}
                </div>
                <div class="orders-column">
                    <h3>En Preparación</h3>
                    ${renderOrdersByStatus(filteredOrders, ['preparing'])}
                </div>
                <div class="orders-column">
                    <h3>Completados</h3>
                    ${renderOrdersByStatus(filteredOrders, ['completed'])}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function renderOrdersByStatus(orders, statuses) {
    return orders
        .filter(order => statuses.includes(order.status))
        .map(order => {
            const orderTime = new Date(order.createdAt);
            const timeAgo = getTimeAgo(orderTime);
            
            return `
                <div class="kitchen-order-card ${order.status}">
                    <div class="order-header">
                        <h4>Orden #${order._id.slice(-6)}</h4>
                        <span class="time-stamp">${timeAgo}</span>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="kitchen-order-item">
                                <span class="quantity">${item.quantity}x</span>
                                <span class="item-name">${item.menuItem.nombre}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-footer">
                        <div class="customer-info">
                            <small>${order.customerName} - ${order.customerPhone}</small>
                        </div>
                        ${order.status !== 'completed' ? `
                            <div class="order-actions">
                                <button onclick="updateOrderStatus('${order._id}', '${
                                    order.status === 'paid' ? 'preparing' : 'completed'
                                }')" class="status-button">
                                    ${order.status === 'paid' ? 'Comenzar Preparación' : 'Marcar Completado'}
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('') || '<p class="no-orders">No hay pedidos</p>';
}
function getTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Justo ahora';
    if (diffInMinutes === 1) return 'Hace 1 minuto';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return 'Hace 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    return date.toLocaleDateString();
}
// Agregar algunas animaciones al eliminar pedidos completados
function updateOrderStatus(orderId, newStatus) {
    fetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => {
        if (!response.ok) throw new Error('Error updating order status');
        
        // Si se marca como completado, agregar animación de desaparición
        if (newStatus === 'completed') {
            const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
            if (orderCard) {
                orderCard.classList.add('fade-out');
                setTimeout(() => {
                    loadOrders();
                }, 500); // Coincidir con la duración de la animación CSS
            } else {
                loadOrders();
            }
        } else {
            loadOrders();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al actualizar el estado del pedido');
    });
}

function filterOrders() {
    const status = document.getElementById('statusFilter').value;
    const orders = document.querySelectorAll('.order-card');
    
    orders.forEach(order => {
        if (status === 'all' || order.dataset.status === status) {
            order.style.display = 'block';
        } else {
            order.style.display = 'none';
        }
    });
}

// Actualizar pedidos cada minuto
setInterval(loadOrders, 60000);