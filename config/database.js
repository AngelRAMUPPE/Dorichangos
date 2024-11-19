import mongoose from 'mongoose'
import env from './env.js'
const connectDB = async () => {
  try {
    await mongoose.connect(env.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('MongoDB conectado exitosamente')
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error)
    process.exit(1)
  }
}

export default connectDB 