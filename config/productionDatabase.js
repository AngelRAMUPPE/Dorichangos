import mongoose from 'mongoose'
import env from './env.js'
const prodConnection = mongoose.createConnection(env.mongodb.prodUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// Definir modelos para la base de datos de producción
const ProdMenu = prodConnection.model('Menu', {
  nombre: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  ingredientes: [{
    type: String
  }],
  foto: {
    data: Buffer,
    contentType: String
  },
  tipo: {
    type: String,
    required: true,
    enum: ['salado', 'paquetes', 'bebidas', 'agridulce']
  }
})

const ProdEvent = prodConnection.model('Event', {
  image: {
    data: Buffer,
    contentType: String
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const ProdCatering = prodConnection.model('Catering', {
  nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    foto: {
        data: Buffer,
        contentType: String
    }
})

export { prodConnection, ProdMenu, ProdEvent, ProdCatering }