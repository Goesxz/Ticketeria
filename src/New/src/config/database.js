const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'gooes',
    });
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erro MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Eventos de conexão para produção
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado. Tentando reconectar...');
});

module.exports = connectDB;
