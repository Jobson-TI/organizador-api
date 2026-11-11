const express = require("express");
const router = express.Router();

const db = require("../db");
const { validarItem, idValido } = require("../validacoes");

const SELECT_ITENS = `
    SELECT itens.id, itens.nome, itens.local, itens.comodo_id, comodos.nome AS comodo
    FROM itens
    JOIN comodos ON itens.comodo_id = comodos.id
`;

function buscarItem(id) {
    return db.prepare(SELECT_ITENS + " WHERE itens.id = ?").get(id);
}

router.get("/", function (req, res) {
    const itens = db.prepare(SELECT_ITENS).all();
    res.json(itens);
});

router.get("/:id", function(req, res){
    const id = Number(req.params.id);
    if (!idValido(id)) {
        return res.status(400).json({ erro: "Id inválido" });
    }
    
    const item = buscarItem(id);
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
    const comodo_id = req.body.comodo_id;
    const local = req.body.local.trim();
    
    const resultado = db
    .prepare("INSERT INTO itens (nome, comodo_id, local) VALUES (?, ?, ?)")
    .run(nome.trim(), comodo_id, local.trim());

    res.status(201).json(buscarItem(resultado.lastInsertRowid))
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
    const comodo_id = req.body.comodo_id;
    const local = req.body.local.trim();
    
    if (!idValido(id)) {
        return res.status(400).json({ erro: "Id inválido" });
    }

    const resultado = db
        .prepare("UPDATE itens SET nome = ?, comodo_id = ?, local = ? WHERE id = ?")
        .run(nome.trim(), comodo_id, local.trim(), id);

    if(resultado.changes === 0) {
        return res.status(404).json({ erro: "Item não encontrado" });
    }


    res.json(buscarItem(id));
});

module.exports = router;