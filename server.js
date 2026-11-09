const express = require("express");
const app = express();
const fs = require("fs");

app.use(express.json());
app.use(express.static("public"));
const port = 3000;

let itens = [];

if(fs.existsSync("itens.json")){
    itens = JSON.parse(fs.readFileSync("itens.json", "utf-8"));
}

function salvar(){
    fs.writeFileSync("itens.json", JSON.stringify(itens, null, 2));
}

let proximoId = 1;

itens.forEach(function (i){
    if(i.id >= proximoId) {
        proximoId = i.id + 1;
    }
});

app.get("/sobre", function(req, res){
    res.send("Testado 1, 2, 3, funcionado");
});

app.get("/itens", function (req, res) {
    res.json(itens);
});

app.post("/itens", function(req, res){
    const nome = req.body.nome;
    const comodo = req.body.comodo;
    const local = req.body.local;

    if(!nome || !comodo || !local){
        return res.status(400).json({ erro: "Preencha nome, cômodo e local" });
    }

    const novo = { id: proximoId, nome: nome, comodo: comodo, local: local };
    proximoId += 1;

    itens.push(novo)
    salvar();

    res.status(201).json(novo)
});

app.delete("/itens/:id", function(req, res){
    const id = Number(req.params.id);

    const pos = itens.findIndex(function (i){
        return i.id === id;
    });

    if(pos === -1){
        return res.status(404).json({ erro: "Id incorreto" })
    } else {
        itens.splice(pos, 1);
        salvar();
        res.status(204).send();
    }

});

app.put("/itens/:id", function(req, res){
    const id = Number(req.params.id);

    const item = itens.find(function (i){
        return i.id === id;
    });

    if(!item) {
        return res.status(404).json({ erro: "Item não encontrado" });
    }

    const nome = req.body.nome;
    const comodo = req.body.comodo;
    const local = req.body.local;

    if(!nome || !comodo || !local){
        return res.status(400).json({ erro: "Preencha nome, cômodo e local" });
    }

    item.nome = nome;
    item.comodo = comodo;
    item.local = local;

    salvar();
    res.status(200).json(item);
});

app.get("/itens/:id", function(req, res){
    const id = Number(req.params.id);

    const item = itens.find(function (i) {
        return i.id === id;
    });

    if(!item) {
        return res.status(404).json({ erro: "Item não encontrado" });
    }
    res.json(item);
});

app.listen(port, function(){
    console.log(`Servidor rodando em http://localhost:${port}`);
});