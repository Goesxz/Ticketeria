const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

// ── Helper: gerar JWT ─────────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  });
};

// ── Helper: resposta de sucesso com user + token ──────────────────────────────
const sendAuthResponse = (res, statusCode, user, token) => {
  return res.status(statusCode).json({
    token,
    user: user.toSafeObject(),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  console.log("[AUTH] POST /register — body:", req.body);

  const { name, email, password } = req.body;

  // ── Validação básica ────────────────────────────────────────────────────────
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Preencha todos os campos." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Senha deve ter ao menos 6 caracteres." });
  }

  try {
    // ── Verificar duplicidade ───────────────────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase().trim() });

    if (existing) {
      console.log("[AUTH] E-mail já cadastrado:", email);
      return res
        .status(409)
        .json({ message: "Usuário já existe com este e-mail." });
    }

    // ── Criar usuário (senha é hasheada pelo middleware pre-save) ───────────
    const user = await User.create({ name, email, password });

    console.log("[AUTH] Usuário criado com sucesso:", user._id);

    const token = generateToken(user._id);

    return sendAuthResponse(res, 201, user, token);
  } catch (err) {
    console.error("[AUTH] Erro no register:", err);

    // Erro de validação do Mongoose
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(". ");
      return res.status(400).json({ message });
    }

    // Índice único violado (race condition)
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Usuário já existe com este e-mail." });
    }

    return res
      .status(500)
      .json({ message: "Erro no servidor. Tente novamente." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  console.log("[AUTH] POST /login — body:", { email: req.body.email });

  const { email, password } = req.body;

  // ── Validação básica ────────────────────────────────────────────────────────
  if (!email || !password) {
    return res.status(400).json({ message: "Preencha e-mail e senha." });
  }

  try {
    // ── Buscar usuário incluindo o campo password (select: false no schema) ──
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      console.log("[AUTH] Usuário não encontrado:", email);
      // Mensagem genérica para não revelar se o e-mail existe
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // ── Comparar senha ──────────────────────────────────────────────────────
    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      console.log("[AUTH] Senha incorreta para:", email);
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    console.log("[AUTH] Login bem-sucedido:", user._id);

    const token = generateToken(user._id);

    return sendAuthResponse(res, 200, user, token);
  } catch (err) {
    console.error("[AUTH] Erro no login:", err);
    return res
      .status(500)
      .json({ message: "Erro no servidor. Tente novamente." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me   (rota protegida — requer token)
// ─────────────────────────────────────────────────────────────────────────────
const me = async (req, res) => {
  try {
    // req.userId é injetado pelo middleware protect (ver authMiddleware.js)
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json({ user: user.toSafeObject() });
  } catch (err) {
    console.error("[AUTH] Erro no /me:", err);
    return res.status(500).json({ message: "Erro no servidor." });
  }
};

module.exports = { register, login, me };
