module.exports = function (app, db) {
    // 1. Rota para Criar Agendamento
    app.post("/agendar", async (req, res) => {
        const { nome, telefone, email, servico, data, hora } = req.body;

        if (!nome || !telefone || !data || !hora) {
            return res.status(400).send("Nome, telefone, data e hora são obrigatórios.");
        }

        try {
            const result = await db.query(
                `INSERT INTO agendamentos(nome, telefone, email, servico, data, hora)
                 VALUES($1,$2,$3,$4,$5,$6)
                 RETURNING id`,
                [nome, telefone, email, servico, data, hora]
            );

            res.json({ 
                msg: "Agendado com sucesso", 
                id: result.rows[0].id 
            });
        } catch (err) {
            // UNIQUE(data,hora) dispara erro
            return res.status(400).send("Este horário já foi preenchido por outro cliente.");
        }
    });

    // 2. Rota para Buscar Agendamentos pelo Telefone
    app.get("/meus-agendamentos/:telefone", async (req, res) => {
        const telefone = req.params.telefone;

        try {
            const result = await db.query(
                `SELECT id, data, hora, servico 
                 FROM agendamentos 
                 WHERE telefone=$1 
                 ORDER BY data DESC`,
                [telefone]
            );
            res.json(result.rows);
        } catch (err) {
            res.status(500).send("Erro ao buscar agendamentos.");
        }
    });

    // 3. Rota para Cancelar Agendamento
    app.delete("/cancelar/:id", async (req, res) => {
        const id = req.params.id;

        try {
            const result = await db.query(
                `DELETE FROM agendamentos WHERE id=$1`,
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).send("Agendamento não encontrado.");
            }

            res.send("Agendamento cancelado com sucesso!");
        } catch (err) {
            res.status(500).send("Erro interno ao tentar cancelar.");
        }
    });
};