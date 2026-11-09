const express = require("express");
const app = express();
const Database = require("better-sqlite3");
const db = new Database("organizador.db");

if (!process.env.TOKEN) {
    console.error("Erro: defina o TOKEN no arquivo .env");
    process.exit(1);   
}

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

function verificarToken(req, res, next){
    const auth = req.headers.authorization

    if (auth !== `Bearer ${process.env.TOKEN}`) {
        return res.status(401).json({ erro: "Não autorizado" });
    }
    next();
    
}

const COMODOS = ["Quarto", "Sala", "Banheiro", "Cozinha", "Quarto_2"];

function validarItem(body) {
    const nome = body.nome;
    const comodo = body.comodo;
    const local = body.local;

    if (typeof nome !== "string" || nome.trim() === "") {
        return "O nome é obrigatório";
    }
    if (nome.trim().length > 50) {
        return "O nome pode ter no máximo 50 caracteres";
    }
    if (!COMODOS.includes(comodo)) {
        return "Selecione um comodo valido"
    }
    if (typeof local !== "string" || local.trim() === "") {
        return "O local é obrigatório";
    }
    if (local.trim().length > 100) {
        return "O local pode ter no máximo 100 caracteres";
    }

    return null;   
}

function idValido(id) {
    return Number.isInteger(id) && id > 0;
}

app.use("/itens", verificarToken);

app.get("/sobre", function(req, res){
    res.send("Testado 1, 2, 3, funcionado");
});

app.get("/itens", function (req, res) {
    const itens = db.prepare("SELECT * FROM itens").all();
    res.json(itens);
});

app.post("/itens", function(req, res){
    const nome = req.body.nome.trim();
    const comodo = req.body.comodo;
    const local = req.body.local.trim();
    const erro = validarItem(req.body);

    if (erro) {
        return res.status(400).json({ erro: erro });
    }

    const resultado = db
    .prepare("INSERT INTO itens (nome, comodo, local) VALUES (?, ?, ?)")
    .run(nome.trim(), comodo, local.trim());

    const novo = { id: resultado.lastInsertRowid, nome: nome, comodo: comodo, local: local };

    res.status(201).json(novo)
});

app.delete("/itens/:id", function(req, res){
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

app.put("/itens/:id", function(req, res){
    const id = Number(req.params.id);
    const nome = req.body.nome.trim();
    const comodo = req.body.comodo;
    const local = req.body.local.trim();
    const erro = validarItem(req.body);
    
    if (erro) {
        return res.status(400).json({ erro: erro });
    }

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

app.get("/itens/:id", function(req, res){
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

app.listen(port, function(){
    console.log(`Servidor rodando em http://localhost:${port}`);
});