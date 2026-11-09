const express = require("express");
const app = express();
const verificarToken = require("./middlewares/verificarToken");

if (!process.env.TOKEN) {
    console.error("Erro: defina o TOKEN no arquivo .env");
    process.exit(1);   
}

app.use(express.json());
app.use(express.static("public"));
const port = 3000;

const rotasItens = require("./rotas/itens");
app.use("/itens", verificarToken, rotasItens);

app.listen(port, function(){
    console.log(`Servidor rodando em http://localhost:${port}`);
});