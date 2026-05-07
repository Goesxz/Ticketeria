const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Não autorizado. Token ausente.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (err) {
    console.error("[AUTH] Token inválido:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Sessão expirada. Faça login novamente.",
      });
    }

    return res.status(401).json({
      message: "Token inválido.",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        message: "Acesso negado.",
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
