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

module.exports = { validarItem, idValido };