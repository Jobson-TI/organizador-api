const express = require("express");
const router = express.Router();
const db = require("../db");
const { idValido } = require("../validacoes");

router.get("/", function(req, res){
    const comodos = db.prepare("SELECT * FROM comodos ORDER BY nome").all();
    res.json(comodos);
});

router.post("/", function(req, res){
    const nome = req.body.nome;

    if (typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({ erro: "O nome é obrigatório" });
    }
    if (nome.trim().length > 30) {
        return res.status(400).json({ erro: "O nome pode ter no máximo 30 caracteres" });
    }
    const nome_comodo = req.body.nome.trim();
    try {
        const resultado = db.prepare("INSERT INTO comodos (nome) VALUES (?)").run(nome_comodo)
        res.status(201).json({ id:resultado.lastInsertRowid, nome: nome_comodo });
    } catch (erro) {
        if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({ erro: "Esse cômodo já existe"});
        }
        throw erro;
    }

});

router.delete("/:id", function(req, res){
    const id = Number(req.params.id);

    if (!idValido(id)) {
        return res.status(400).json({ erro: "Id inválido" });
    }
    const qtd = db.prepare("SELECT COUNT(*) AS total FROM itens WHERE comodo_id = ?").get(id).total;
    if (qtd > 0) {
        return res.status(409).json({ erro: "Esse cômodo tem itens. Mova ou apague os itens antes."});
    } 
    const resultado = db.prepare("DELETE FROM comodos WHERE id = ?").run(id);
    if (resultado.changes === 0) {
        return res.status(404).json({ erro: "Item não encontrado" })
    } else {
        res.status(204).send();
    }
});

module.exports = router;