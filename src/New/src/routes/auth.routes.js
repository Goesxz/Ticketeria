const router = require("express").Router();

const { register, login, me } = require("../controllers/auth.controller");

const { authenticate } = require("../middlewares/auth.middleware");

// ── ROTAS AUTH ─────────────────────────────

router.post("/register", register);

router.post("/login", login);

// rota protegida
router.get("/me", authenticate, me);

module.exports = router;
