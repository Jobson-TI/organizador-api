const express = require("express");
const router = express.Router();

const db = require("../db");
const { validarItem, idValido } = require("../validacoes");

router.get("/", function (req, res) {
    const itens = db.prepare("SELECT * FROM itens").all();
    res.json(itens);
});

router.get("/:id", function(req, res){
    const id = Number(req.params.id);
    if (!idValido(id)) {
        return res.status(400).json({ erro: "Id inválido" });
    }
    
    const item = db.prepare("SELECT * FROM itens WHERE id = ?").get(id);
    if(!item) {
        return res.status(404).json({ erro: "Item não encontrado" });
    }

    res.json(item);
});

router.post("/", function(req, res){
    const erro = validarItem(req.body);
    if (erro) {
        return res.status(400).json({ erro: erro });
    }
    
    const nome = req.body.nome.trim();
    const comodo = req.body.comodo;
    const local = req.body.local.trim();
    
    const resultado = db
    .prepare("INSERT INTO itens (nome, comodo, local) VALUES (?, ?, ?)")
    .run(nome.trim(), comodo, local.trim());

    const novo = { id: resultado.lastInsertRowid, nome: nome, comodo: comodo, local: local };

    res.status(201).json(novo)
});

router.delete("/:id", function(req, res){
    const id = Number(req.params.id);

    if (!idValido(id)) {
        return res.status(400).json({ erro: "Id inválido" });
    }

    const resultado = db.prepare("DELETE FROM itens WHERE id = ?").run(id);

    if(resultado.changes === 0){
        return res.status(404).json({ erro: "Id incorreto" })
    } else {
        res.status(204).send();
    }

});

router.put("/:id", function(req, res){
    const erro = validarItem(req.body);
    if (erro) {
        return res.status(400).json({ erro: erro });
    }
    
    const id = Number(req.params.id);
    const nome = req.body.nome.trim();
    const comodo = req.body.comodo;
    const local = req.body.local.trim();
    
    if (!idValido(id)) {
        return res.status(400).json({ erro: "Id inválido" });
    }

    const resultado = db
        .prepare("UPDATE itens SET nome = ?, comodo = ?, local = ? WHERE id = ?")
        .run(nome.trim(), comodo, local.trim(), id);

    if(resultado.changes === 0) {
        return res.status(404).json({ erro: "Item não encontrado" });
    }


    res.json({ id: id, nome: nome, comodo: comodo, local: local });
});

module.exports = router;