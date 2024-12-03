import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
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

const Event = mongoose.model('Event', eventSchema)
export default Event 