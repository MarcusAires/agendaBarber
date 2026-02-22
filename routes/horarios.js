const horarios = [
    "08:00","08:30","09:00","09:30","10:00","10:30",
    "11:00","11:30","13:00","13:30","14:00","14:30",
    "15:00","15:30","16:00","16:30","17:00","17:30","18:00"
];

module.exports = function(app, db) {
    app.get("/horarios/:data", (req, res) => {
        db.all("SELECT hora FROM agendamentos WHERE data=?",
            [req.params.data],
            (err, rows) => {
                if (err) return res.sendStatus(500);

                rows = rows || [];
                const ocupados = rows.map(r => r.hora);
                const livres = horarios.filter(h => !ocupados.includes(h));
                res.json(livres);
            });
    });
};