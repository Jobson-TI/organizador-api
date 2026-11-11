const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Faça login para continuar" });
  }

  const token = auth.split(" ")[1];

  try {
    const dados = jwt.verify(token, process.env.JWT_SEGREDO);
    req.usuarioId = dados.id;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: "Sessão inválida ou expirada" });
  }
}

module.exports = verificarToken;
