const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mi-database.sqlite');

// Crear tabla de usuarios si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      contraseña TEXT NOT NULL
    )
  `);
});

module.exports = db;