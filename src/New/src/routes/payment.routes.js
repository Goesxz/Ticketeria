const router = require('express').Router();
const {
  createPaymentIntent, createPixPayment, stripeWebhook, confirmPixDev,
} = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Webhook (raw body configurado no server.js)
router.post('/webhook', stripeWebhook);

// Rotas autenticadas
router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/pix', authenticate, createPixPayment);

// Apenas em desenvolvimento
router.post('/confirm-pix/:orderId', authenticate, confirmPixDev);

module.exports = router;
