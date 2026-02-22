const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path"); // Boa prática para caminhos

const app = express();
app.use(express.json());
app.use(cors());

// Serve os arquivos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Banco de dados
const db = new sqlite3.Database("database.db");

// No seu server.js, atualize o db.run:
db.run(`
CREATE TABLE IF NOT EXISTS agendamentos(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 nome TEXT,
 telefone TEXT,   -- Novo campo
 email TEXT,      -- Novo campo
 servico TEXT,
 data TEXT,
 hora TEXT,
 UNIQUE(data,hora)
)`);
// IMPORTANTE: Ajuste os nomes conforme a imagem (pasta 'routes')
require("./routes/horarios")(app, db);
require("./routes/agendamento")(app, db);
require("./routes/admin")(app, db);

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});