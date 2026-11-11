const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../db");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { erro: "Muitas tentativas. Tente de novo em 15 minutos." },
});

const limiteCadastro = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 5,
  message: { erro: "Limite de cadastro atingido, renovação em 24 horas." },
});

router.post("/cadastro", limiteCadastro, function (req, res) {
  const email = req.body.email;
  const senha = req.body.senha;

  if (typeof email !== "string" || email.trim() === "") {
    return res.status(400).json({ erro: "O email é obrigatório" });
  }
  if (!email.includes("@")) {
    return res.status(400).json({ erro: "O email precisar ter um @" });
  }
  if (email.trim().length > 100) {
    return res
      .status(400)
      .json({ erro: "O email pode ter no máximo 100 caracteres" });
  }
  if (typeof senha !== "string") {
    return res.status(400).json({ erro: "A senha é obrigatória" });
  }
  if (senha.length < 8) {
    return res
      .status(400)
      .json({ erro: "A senha precisa ter no minimo 8 caracteres" });
  }

  const emailLimpo = email.trim().toLowerCase();
  const senha_hash = bcrypt.hashSync(senha, 10);

  try {
    const cadastrar = db.transaction(function () {
      const resultado = db
        .prepare("INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)")
        .run(emailLimpo, senha_hash);
      const novoId = resultado.lastInsertRowid;
      const inserirComodo = db.prepare(
        "INSERT INTO comodos (nome, usuario_id) VALUES (?, ?)",
      );

      ["Quarto", "Sala", "Banheiro", "Cozinha"].forEach(function (nome) {
        inserirComodo.run(nome, novoId);
      });

      return novoId;
    });
    const novoId = cadastrar();
    res.status(201).json({ id: novoId, email: emailLimpo });
  } catch (erro) {
    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ erro: "Esse conta já existe" });
    }
    throw erro;
  }
});

router.post("/login", limiteLogin, function (req, res) {
  const email = req.body.email;
  const senha = req.body.senha;

  if (typeof email !== "string") {
    return res.status(400).json({ erro: "O email é obrigatório" });
  }
  if (typeof senha !== "string") {
    return res.status(400).json({ erro: "A senha é obrigatória" });
  }

  const usuario = db
    .prepare("SELECT * FROM usuarios WHERE email = ?")
    .get(email.trim().toLowerCase());

  if (!usuario || !bcrypt.compareSync(senha, usuario.senha_hash)) {
    return res.status(401).json({ erro: "E-mail ou senha incorretos" });
  }

  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SEGREDO, {
    expiresIn: "7d",
  });

  res.json({ token: token });
});

module.exports = router;
