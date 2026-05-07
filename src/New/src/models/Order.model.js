const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  eventName: { type: String, required: true },   // snapshot do nome no momento da compra
  ticketTypeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ticketTypeName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'pix', 'boleto'],
      required: true,
    },
    paymentIntentId: {
      type: String,  // Stripe PaymentIntent ID
      default: null,
    },
    pixCode: {
      type: String,  // Código Pix (simulado ou real)
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    // Ingresso gerado após pagamento
    tickets: [
      {
        code: { type: String, unique: true, sparse: true },
        itemIndex: Number,
        isUsed: { type: Boolean, default: false },
        usedAt: { type: Date, default: null },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Gerar códigos de ingresso ao confirmar pagamento
orderSchema.methods.generateTickets = function () {
  const tickets = [];
  this.items.forEach((item, idx) => {
    for (let i = 0; i < item.quantity; i++) {
      tickets.push({
        code: `GOO-${Date.now()}-${idx}-${i}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        itemIndex: idx,
        isUsed: false,
      });
    }
  });
  this.tickets = tickets;
};

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentIntentId: 1 });

module.exports = mongoose.model('Order', orderSchema);
