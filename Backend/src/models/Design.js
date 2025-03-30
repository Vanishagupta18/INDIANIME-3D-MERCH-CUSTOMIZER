import mongoose from 'mongoose'

const designSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  shareId: {
    type: String,
    required: true,
    unique: true
  },
  designData: {
    color: { type: String, default: '#ffffff' },
    texture: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    logoPosition: { type: Object, default: {} },
    prompt: { type: String, default: '' }
  },
  isPublic: { type: Boolean, default: true },
  title: { type: String, default: 'My Custom Design' },
  views: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('Design', designSchema)