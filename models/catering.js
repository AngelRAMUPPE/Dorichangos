import mongoose from 'mongoose'

const cateringSchema = new mongoose.Schema({
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
});

const Catering = mongoose.model('Catering', cateringSchema)
export default Catering 