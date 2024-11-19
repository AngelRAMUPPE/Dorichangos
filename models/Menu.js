import mongoose from 'mongoose'

const menuSchema = new mongoose.Schema({
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

const Menu = mongoose.model('Menu', menuSchema)
export default Menu 