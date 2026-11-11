const Database = require("better-sqlite3");
const db = new Database("organizador.db");
db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS comodos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        comodo_id INTEGER NOT NULL REFERENCES comodos(id),
        local TEXT NOT NULL
    );
`);

const total = db.prepare("SELECT COUNT(*) AS total FROM comodos").get().total;

if (total === 0) {
  const inserir = db.prepare("INSERT INTO comodos (nome) VALUES (?)");
  ["Quarto", "Sala", "Banheiro", "Cozinha"].forEach(function (nome) {
    inserir.run(nome);
  });
}

module.exports = db;
