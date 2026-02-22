const ADMIN_KEY = "123segredo"; // senha do barbeiro

module.exports = function(app, db) {
    app.get("/agenda/:data", (req, res) => {
        if (req.headers.authorization !== ADMIN_KEY)
            return res.sendStatus(401);

        db.all(
            "SELECT * FROM agendamentos WHERE data=? ORDER BY hora",
            [req.params.data],
            (err, rows) => res.json(rows || [])
        );
    });

    app.delete("/delete/:id", (req, res) => {
        if (req.headers.authorization !== ADMIN_KEY)
            return res.sendStatus(401);

        db.run("DELETE FROM agendamentos WHERE id=?", [req.params.id]);
        res.send("apagado");
    });
};