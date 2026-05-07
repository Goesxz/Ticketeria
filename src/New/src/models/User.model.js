const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nome é obrigatório"],
      trim: true,
      minlength: [2, "Nome deve ter ao menos 2 caracteres"],
      maxlength: [80, "Nome deve ter no máximo 80 caracteres"],
    },

    email: {
      type: String,
      required: [true, "E-mail é obrigatório"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de e-mail inválido"],
    },

    password: {
      type: String,
      required: [true, "Senha é obrigatória"],
      minlength: [6, "Senha deve ter ao menos 6 caracteres"],
      select: false, // nunca retorna o hash nas queries por padrão
    },
  },
  {
    timestamps: true, // createdAt e updatedAt automáticos
  },
);

// ── Middleware: criptografar senha antes de salvar ────────────────────────────
UserSchema.pre("save", async function (next) {
  // Só re-hasheia se a senha foi modificada (evita re-hash em updates)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ── Método de instância: comparar senha no login ──────────────────────────────
UserSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// ── Método de instância: retornar usuário sem campos sensíveis ────────────────
UserSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", UserSchema);
