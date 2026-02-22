require('dotenv').config(); // carregar o .env
const express = require("express");
const { Pool } = require("pg"); // Importa o PostgreSQL
const cors = require("cors");
const path = require("path"); // Boa prática para caminhos

const app = express();
app.use(express.json());
app.use(cors());

// Serve os arquivos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Banco de dados
// Configuração do Banco de Dados PostgreSQL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Obrigatório para Neon/Render
});

// Criar tabela (Sintaxe Postgres é levemente diferente)
const initDb = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS agendamentos(
        id SERIAL PRIMARY KEY,
        nome TEXT,
        telefone TEXT,
        email TEXT,
        servico TEXT,
        data TEXT,
        hora TEXT,
        UNIQUE(data, hora)
      )`);
    console.log("Banco de Dados pronto!");
  } catch (err) {
    console.error("Erro ao iniciar banco:", err);
  }
};
initDb();
// IMPORTANTE: Ajuste os nomes conforme a imagem (pasta 'routes')
require("./routes/horarios")(app, db);
require("./routes/agendamento")(app, db);
require("./routes/admin")(app, db);

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});