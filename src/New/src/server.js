require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();

/*
|--------------------------------------------------------------------------
| Middlewares Globais
|--------------------------------------------------------------------------
*/

// Body parser DEVE vir antes das rotas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Logger simples
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Gooes API",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((_req, res) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);

  res.status(err.status || 500).json({
    message: err.message || "Erro interno do servidor.",
  });
});

/*
|--------------------------------------------------------------------------
| Database + Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI não definida");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET não definida");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");

    app.listen(PORT, () => {
      console.log(`🚀 Gooes API rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar MongoDB:", err.message);
    process.exit(1);
  });

module.exports = app;
