const router = require('express').Router();
const { body } = require('express-validator');
const {
  getEvents, getEventById, createEvent, updateEvent, deleteEvent,
  getMyEvents, getEventStats,
} = require('../controllers/event.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');

const eventRules = [
  body('name').trim().notEmpty().withMessage('Nome do evento é obrigatório'),
  body('description').trim().notEmpty().withMessage('Descrição é obrigatória'),
  body('date').isISO8601().withMessage('Data inválida'),
  body('category').isIn(['music', 'sports', 'arts', 'technology', 'food', 'business', 'other']),
  body('location.venue').notEmpty().withMessage('Local é obrigatório'),
  body('location.city').notEmpty().withMessage('Cidade é obrigatória'),
  body('location.state').notEmpty().withMessage('Estado é obrigatório'),
  body('location.address').notEmpty().withMessage('Endereço é obrigatório'),
  body('ticketTypes').isArray({ min: 1 }).withMessage('Ao menos um tipo de ingresso é necessário'),
  body('ticketTypes.*.name').notEmpty(),
  body('ticketTypes.*.price').isFloat({ min: 0 }),
  body('ticketTypes.*.quantity').isInt({ min: 1 }),
];

// Rotas públicas
router.get('/', getEvents);
router.get('/:id', getEventById);

// Rotas privadas (organizer/admin)
router.get('/organizer/mine', authenticate, authorize('organizer', 'admin'), getMyEvents);
router.get('/organizer/:id/stats', authenticate, authorize('organizer', 'admin'), getEventStats);
router.post('/', authenticate, authorize('organizer', 'admin'), eventRules, validate, createEvent);
router.patch('/:id', authenticate, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', authenticate, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
