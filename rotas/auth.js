const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../db");

router.post("/cadastro", function (req, res) {
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
    const resultado = db
      .prepare("INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)")
      .run(emailLimpo, senha_hash);
    res.status(201).json({ id: resultado.lastInsertRowid, email: emailLimpo });
  } catch (erro) {
    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ erro: "Esse conta já existe" });
    }
    throw erro;
  }
});

module.exports = router;
