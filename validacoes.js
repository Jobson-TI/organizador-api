const db = require("./db");

function validarItem(body, usuarioId) {
  const nome = body.nome;
  const comodo_id = body.comodo_id;
  const local = body.local;

  if (typeof nome !== "string" || nome.trim() === "") {
    return "O nome é obrigatório";
  }
  if (nome.trim().length > 50) {
    return "O nome pode ter no máximo 50 caracteres";
  }
  if (!Number.isInteger(comodo_id)) {
    return "Selecione um cômodo válido";
  }
  const comodo = db
    .prepare("SELECT id FROM comodos WHERE id = ? AND usuario_id = ?")
    .get(comodo_id, usuarioId);
  if (!comodo) {
    return "Esse cômodo não existe";
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

module.exports = { validarItem, idValido };
