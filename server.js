const express = require("express");
const app = express();
const Database = require("better-sqlite3");
const db = new Database("organizador.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        comodo TEXT NOT NULL,
        local TEXT NOT NULL
    )
`);

app.use(express.json());
app.use(express.static("public"));
const port = 3000;

app.get("/sobre", function(req, res){
    res.send("Testado 1, 2, 3, funcionado");
});

app.get("/itens", function (req, res) {
    const itens = db.prepare("SELECT * FROM itens").all();
    res.json(itens);
});

app.post("/itens", function(req, res){
    const nome = req.body.nome;
    const comodo = req.body.comodo;
    const local = req.body.local;

    if(!nome || !comodo || !local){
        return res.status(400).json({ erro: "Preencha nome, cômodo e local" });
    }

    const resultado = db
    .prepare("INSERT INTO itens (nome, comodo, local) VALUES (?, ?, ?)")
    .run(nome, comodo, local);

    const novo = { id: resultado.lastInsertRowid, nome: nome, comodo: comodo, local: local };

    res.status(201).json(novo)
});

app.delete("/itens/:id", function(req, res){
    const id = Number(req.params.id);
    const resultado = db.prepare("DELETE FROM itens WHERE id = ?").run(id);

    if(resultado.changes === 0){
        return res.status(404).json({ erro: "Id incorreto" })
    } else {
        itens.splice(pos, 1);
        salvar();
        res.status(204).send();
    }

});

app.put("/itens/:id", function(req, res){
    const id = Number(req.params.id);
    const nome = req.body.nome;
    const comodo = req.body.comodo;
    const local = req.body.local;

    if(!nome || !comodo || !local){
        return res.status(400).json({ erro: "Preencha nome, cômodo e local" });
    }

    const resultado = db
        .prepare("UPDATE itens SET nome = ?, comodo = ?, local = ? WHERE id = ?")
        .run(nome, comodo, local, id);

    if(resultado.changes === 0) {
        return res.status(404).json({ erro: "Item não encontrado" });
    }


    res.json({ id: id, nome: nome, comodo: comodo, local: local });
});

app.get("/itens/:id", function(req, res){
    const id = Number(req.params.id);
    const item = db.prepare("SELECT * FROM itens WHERE id = ?").get(id);

    if(!item) {
        return res.status(404).json({ erro: "Item não encontrado" });
    }
    res.json(item);
});

app.listen(port, function(){
    console.log(`Servidor rodando em http://localhost:${port}`);
});