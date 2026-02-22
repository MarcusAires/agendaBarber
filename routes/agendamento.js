module.exports = function (app, db) {
    // 1. Rota para Criar Agendamento
    app.post("/agendar", (req, res) => {
        // Recebendo os novos campos do formulário
        const { nome, telefone, email, servico, data, hora } = req.body;

        // Validando se os campos obrigatórios existem
        if (!nome || !telefone || !data || !hora) {
            return res.status(400).send("Nome, telefone, data e hora são obrigatórios.");
        }

        db.run(
            "INSERT INTO agendamentos(nome, telefone, email, servico, data, hora) VALUES(?,?,?,?,?,?)",
            [nome, telefone, email, servico, data, hora],
            function (err) {
                if (err) {
                    // O erro geralmente ocorre por causa do UNIQUE(data, hora) no banco
                    return res.status(400).send("Este horário já foi preenchido por outro cliente.");
                }
                
                // Retornamos o ID para o cliente usar no link do WhatsApp (opcional agora)
                res.json({ 
                    msg: "Agendado com sucesso", 
                    id: this.lastID 
                });
            }
        );
    });

    // 2. Rota para Buscar Agendamentos pelo Telefone (NOVA ROTA)
    app.get("/meus-agendamentos/:telefone", (req, res) => {
        const telefone = req.params.telefone;
        
        db.all(
            "SELECT id, data, hora, servico FROM agendamentos WHERE telefone = ? ORDER BY data DESC",
            [telefone],
            (err, rows) => {
                if (err) {
                    return res.status(500).send("Erro ao buscar agendamentos.");
                }
                res.json(rows || []);
            }
        );
    });

    // 3. Rota para Cancelar Agendamento
    app.delete("/cancelar/:id", (req, res) => {
        const id = req.params.id;

        db.run("DELETE FROM agendamentos WHERE id=?", [id], function (err) {
            if (err) {
                return res.status(500).send("Erro interno ao tentar cancelar.");
            }
            
            // Verificamos se alguma linha foi realmente deletada
            if (this.changes === 0) {
                return res.status(404).send("Agendamento não encontrado.");
            }

            res.send("Agendamento cancelado com sucesso!");
        });
    });
};