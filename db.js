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

module.exports = db;