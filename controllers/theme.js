const { Db, ObjectID } = require("mongodb");
const Theme = require('../classes/Theme');

const themes = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error("Invalid Database");
    }

    const themeClass = new Theme(db);

    app.post("/themes/new", async (req, res) => {
        const data = req.body;
        const reponse = await themeClass.createTheme(data);
        if (reponse.result.n !== 1 && reponse.result.ok !== 1) {
            return res.json({ type: "erreur", message: "Erreur lors de la création du thème" })
        }
        return res.json(reponse.ops[0]);
    })

    app.get("/themes/all", async (req, res) => {
        const reponse = await themeClass.getAllThemes();
        return res.json(reponse);
    })
}

module.exports = themes;