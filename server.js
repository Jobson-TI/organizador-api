const express = require("express");
const app = express();
const verificarToken = require("./middlewares/verificarToken");

if (!process.env.TOKEN) {
  console.error("Erro: defina o TOKEN no arquivo .env");
  process.exit(1);
}

if (!process.env.JWT_SEGREDO) {
  console.error("Erro: defina o JWT_SEGREDO no arquivo .env");
  process.exit(1);
}

app.use(express.json());
app.use(express.static("public"));
const port = 3000;

const rotasAuth = require("./rotas/auth");
app.use("/auth", rotasAuth);

const rotasComodos = require("./rotas/comodos");
app.use("/comodos", verificarToken, rotasComodos);

const rotasItens = require("./rotas/itens");
app.use("/itens", verificarToken, rotasItens);

app.listen(port, function () {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
