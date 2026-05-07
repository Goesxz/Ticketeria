// src/utils/seed.js
// Popula o banco com dados de exemplo para desenvolvimento
// Uso: npm run seed

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Event = require('../models/Event.model');

const connectDB = require('../config/database');

const EVENTS = [
  {
    name: 'The Weeknd - After Hours Tour',
    description: 'A maior turnê da carreira de The Weeknd chega ao Brasil com uma produção épica.',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    category: 'music',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    location: { venue: 'Allianz Parque', address: 'Av. Francisco Matarazzo, 1705', city: 'São Paulo', state: 'SP', zipCode: '05001-200' },
    ticketTypes: [
      { name: 'Pista', price: 280, quantity: 5000 },
      { name: 'Pista Premium', price: 480, quantity: 2000 },
      { name: 'Camarote', price: 980, quantity: 500 },
    ],
    featured: true,
    tags: ['pop', 'r&b', 'show internacional'],
  },
  {
    name: 'Rock in Rio 2025',
    description: 'O maior festival de música do mundo retorna com line-up histórico.',
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    category: 'music',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    location: { venue: 'Cidade do Rock', address: 'Av. Salvador Allende, s/n', city: 'Rio de Janeiro', state: 'RJ', zipCode: '22775-001' },
    ticketTypes: [
      { name: 'Dia 1', price: 395, quantity: 20000 },
      { name: 'Dia 2', price: 395, quantity: 20000 },
      { name: 'Pacote 2 dias', price: 690, quantity: 5000 },
    ],
    featured: true,
    tags: ['rock', 'festival', 'ao ar livre'],
  },
  {
    name: 'React Summit BR 2025',
    description: 'A maior conferência de React da América Latina. Speakers internacionais, workshops e networking.',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    category: 'technology',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    location: { venue: 'WTC Events Center', address: 'Av. das Nações Unidas, 12551', city: 'São Paulo', state: 'SP', zipCode: '04578-903' },
    ticketTypes: [
      { name: 'Early Bird', price: 299, quantity: 200 },
      { name: 'Standard', price: 499, quantity: 500 },
      { name: 'VIP + Workshop', price: 899, quantity: 50 },
    ],
    tags: ['react', 'javascript', 'frontend', 'tech'],
  },
  {
    name: 'Flamengo x Palmeiras — Brasileirão',
    description: 'O clássico mais esperado da rodada. Maracanã lotado para essa batalha de gigantes.',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
    location: { venue: 'Estádio do Maracanã', address: 'Av. Presidente Castelo Branco, s/n', city: 'Rio de Janeiro', state: 'RJ', zipCode: '20271-130' },
    ticketTypes: [
      { name: 'Geral Sul', price: 60, quantity: 8000 },
      { name: 'Leste Inferior', price: 120, quantity: 4000 },
      { name: 'Setor Norte Premium', price: 200, quantity: 1000 },
    ],
    tags: ['futebol', 'brasileirão', 'flamengo', 'palmeiras'],
  },
];

async function seed() {
  await connectDB();

  console.log('🌱 Iniciando seed...');

  // Limpa collections
  await Promise.all([User.deleteMany({}), Event.deleteMany({})]);

  // Cria organizador
  const organizer = await User.create({
    name: 'Admin Gooes',
    email: 'admin@gooes.com.br',
    password: 'gooes123',
    role: 'organizer',
  });

  // Cria comprador de teste
  await User.create({
    name: 'João Comprador',
    email: 'joao@teste.com',
    password: 'teste123',
    role: 'buyer',
  });

  // Cria eventos vinculados ao organizador
  for (const evt of EVENTS) {
    await Event.create({ ...evt, organizer: organizer._id });
  }

  console.log('✅ Seed concluído!');
  console.log('   Organizador: admin@gooes.com.br / gooes123');
  console.log('   Comprador:   joao@teste.com / teste123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed falhou:', err);
  process.exit(1);
});
