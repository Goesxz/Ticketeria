const Event = require('../models/Event.model');

// GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      city,
      featured,
      sortBy = 'date',
    } = req.query;

    const query = { status: 'published' };

    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (search) query.$text = { $search: search };

    // Apenas eventos futuros por padrão
    if (!req.query.past) query.date = { $gte: new Date() };

    const sort = {};
    if (sortBy === 'price') sort['ticketTypes.price'] = 1;
    else if (sortBy === 'popular') sort['ticketTypes.sold'] = -1;
    else sort.date = 1;

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('organizer', 'name avatar'),
      Event.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name avatar email');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// POST /api/events  (organizer/admin)
const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/events/:id  (organizer dono / admin)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Evento não encontrado.' });

    const isOwner = event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão para editar este evento.' });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Evento não encontrado.' });

    const isOwner = event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão.' });
    }

    // Soft delete: muda status para cancelled
    event.status = 'cancelled';
    await event.save();

    res.json({ success: true, message: 'Evento cancelado com sucesso.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/organizer/mine  (organizer: lista seus eventos)
const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/organizer/:id/stats
const getEventStats = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Evento não encontrado.' });

    const isOwner = event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão.' });
    }

    const stats = event.ticketTypes.map((t) => ({
      name: t.name,
      price: t.price,
      quantity: t.quantity,
      sold: t.sold,
      available: t.quantity - t.sold,
      revenue: t.price * t.sold,
    }));

    const totalRevenue = stats.reduce((sum, t) => sum + t.revenue, 0);
    const totalSold = stats.reduce((sum, t) => sum + t.sold, 0);

    res.json({ success: true, data: { event: event.name, stats, totalRevenue, totalSold } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, getMyEvents, getEventStats };
