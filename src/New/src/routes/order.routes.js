const router = require('express').Router();
const { body } = require('express-validator');
const { createOrder, getMyOrders, getOrderById, getOrganizerSales } = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');

const orderRules = [
  body('items').isArray({ min: 1 }).withMessage('Itens são obrigatórios'),
  body('items.*.eventId').notEmpty().withMessage('eventId é obrigatório'),
  body('items.*.ticketTypeId').notEmpty().withMessage('ticketTypeId é obrigatório'),
  body('items.*.quantity').isInt({ min: 1, max: 10 }).withMessage('Quantidade inválida (1-10)'),
  body('paymentMethod').isIn(['credit_card', 'pix', 'boleto']).withMessage('Método de pagamento inválido'),
];

router.use(authenticate); // todas as rotas de pedido requerem autenticação

router.get('/', getMyOrders);
router.get('/organizer/sales', authorize('organizer', 'admin'), getOrganizerSales);
router.get('/:id', getOrderById);
router.post('/', orderRules, validate, createOrder);

module.exports = router;
