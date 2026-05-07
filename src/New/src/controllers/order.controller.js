const Order = require('../models/Order.model');
const Event = require('../models/Event.model');

// POST /api/orders  — cria pedido e reserva os ingressos
const createOrder = async (req, res, next) => {
  try {
    const { items, paymentMethod } = req.body;

    // Validar estoque e montar os itens do pedido
    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const event = await Event.findById(item.eventId);
      if (!event || event.status !== 'published') {
        return res.status(400).json({ success: false, message: `Evento inválido: ${item.eventId}` });
      }

      const ticketType = event.ticketTypes.id(item.ticketTypeId);
      if (!ticketType) {
        return res.status(400).json({ success: false, message: 'Tipo de ingresso não encontrado.' });
      }

      const available = ticketType.quantity - ticketType.sold;
      if (available < item.quantity) {
        return res.status(409).json({
          success: false,
          message: `Ingressos insuficientes para "${ticketType.name}". Disponível: ${available}`,
        });
      }

      const subtotal = ticketType.price * item.quantity;
      total += subtotal;

      orderItems.push({
        event: event._id,
        eventName: event.name,
        ticketTypeId: ticketType._id,
        ticketTypeName: ticketType.name,
        quantity: item.quantity,
        unitPrice: ticketType.price,
        subtotal,
      });

      // Reserva temporária (incrementa sold)
      ticketType.sold += item.quantity;
      await event.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total,
      paymentMethod,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders  — pedidos do usuário logado
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.event', 'name image date location');

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.event', 'name image date location');

    if (!order) return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });

    // Usuário só vê o próprio pedido (admin vê todos)
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão.' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/organizer/sales  — vendas de todos os eventos do organizador
const getOrganizerSales = async (req, res, next) => {
  try {
    const myEvents = await Event.find({ organizer: req.user._id }).select('_id');
    const eventIds = myEvents.map((e) => e._id);

    const orders = await Order.find({
      'items.event': { $in: eventIds },
      status: 'paid',
    })
      .populate('user', 'name email')
      .populate('items.event', 'name date')
      .sort({ createdAt: -1 });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    res.json({ success: true, data: { orders, totalRevenue, totalOrders: orders.length } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getOrganizerSales };
