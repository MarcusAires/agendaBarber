const ADMIN_KEY = "123segredo"; // senha do barbeiro

module.exports = function(app, db) {
    app.get("/agenda/:data", async (req, res) => {
        if (req.headers.authorization !== ADMIN_KEY)
            return res.sendStatus(401);

        try {
            const result = await db.query(
                `SELECT * FROM agendamentos WHERE data=$1 ORDER BY hora`,
                [req.params.data]
            );
            res.json(result.rows);
        } catch (err) {
            res.status(500).send("Erro ao buscar agenda");
        }
    });

    app.delete("/delete/:id", async (req, res) => {
        if (req.headers.authorization !== ADMIN_KEY)
            return res.sendStatus(401);

        try {
            await db.query(
                `DELETE FROM agendamentos WHERE id=$1`,
                [req.params.id]
            );
            res.send("apagado");
        } catch (err) {
            res.status(500).send("Erro ao deletar agendamento");
        }
    });
};