const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order.model');

// POST /api/payments/create-intent
// Cria um PaymentIntent no Stripe e retorna o clientSecret para o frontend
const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Sem permissão.' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Pedido já processado.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Stripe usa centavos
      currency: 'brl',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    // Salva o intentId no pedido
    order.paymentIntentId = paymentIntent.id;
    await order.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/pix  — Pix simulado (para testes sem Stripe)
const createPixPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Sem permissão.' });
    }

    // Código Pix fictício (em produção, integrar com banco/gateway)
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${req.user._id}${Date.now()}5204000053039865802BR5925Gooes Ingressos6009SAO PAULO62070503***6304${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;

    order.pixCode = pixCode;
    order.paymentMethod = 'pix';
    await order.save();

    // Em produção: configurar expiração de 30min e webhook para confirmar
    res.json({
      success: true,
      pixCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      orderId: order._id,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/webhook  — Stripe Webhook (confirma pagamento)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook inválido:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const order = await Order.findOne({ paymentIntentId: intent.id });

    if (order && order.status === 'pending') {
      order.status = 'paid';
      order.paidAt = new Date();
      order.generateTickets();
      await order.save();
      console.log(`✅ Pedido ${order._id} confirmado.`);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    const order = await Order.findOne({ paymentIntentId: intent.id });
    if (order) {
      order.status = 'cancelled';
      await order.save();
    }
  }

  res.json({ received: true });
};

// POST /api/payments/confirm-pix/:orderId  — Simula confirmação do Pix (apenas dev)
const confirmPixDev = async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Não disponível em produção.' });
  }
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });

    order.status = 'paid';
    order.paidAt = new Date();
    order.generateTickets();
    await order.save();

    res.json({ success: true, message: 'Pix confirmado (simulado).', data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentIntent, createPixPayment, stripeWebhook, confirmPixDev };
