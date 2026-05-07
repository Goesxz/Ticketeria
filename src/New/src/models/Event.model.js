const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },       // ex: "Pista", "VIP"
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  sold: { type: Number, default: 0 },
  description: { type: String, default: '' },
});

ticketTypeSchema.virtual('available').get(function () {
  return this.quantity - this.sold;
});

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome do evento é obrigatório'],
      trim: true,
      maxlength: [200, 'Nome muito longo'],
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      maxlength: [5000, 'Descrição muito longa'],
    },
    date: {
      type: Date,
      required: [true, 'Data é obrigatória'],
    },
    endDate: {
      type: Date,
      default: null,
    },
    location: {
      venue: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    category: {
      type: String,
      enum: ['music', 'sports', 'arts', 'technology', 'food', 'business', 'other'],
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    ticketTypes: [ticketTypeSchema],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'published',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String, lowercase: true, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: preço mínimo
eventSchema.virtual('minPrice').get(function () {
  if (!this.ticketTypes.length) return 0;
  return Math.min(...this.ticketTypes.map((t) => t.price));
});

// Virtual: total de ingressos disponíveis
eventSchema.virtual('totalAvailable').get(function () {
  return this.ticketTypes.reduce((sum, t) => sum + (t.quantity - t.sold), 0);
});

// Índices para busca
eventSchema.index({ name: 'text', description: 'text', tags: 'text' });
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizer: 1 });

module.exports = mongoose.model('Event', eventSchema);
