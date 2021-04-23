const { Db, ObjectID } = require("mongodb");
const Theme = require('../classes/Theme');
const { addCustomMessages, extend, Validator } = require('node-input-validator');

addCustomMessages({
    'theme.required': "Veuillez saisir un thème",
    'checkObjectid': "L'ObjectID du thème n'est pas valide"
})

extend('checkObjectid', ({ value }) => {
    if (ObjectID.isValid(value) === false) {
        return false;
    }
    return true;
})

const themes = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error("Invalid Database");
    }

    const themeClass = new Theme(db);

    // Créer un nouveau thème

    app.post("/api/themes/new", async (req, res) => {
        const data = req.body;
        const v = new Validator(data, {
            theme: 'required|string'
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(400).json(v.errors);
        }
        const reponse = await themeClass.createTheme(data);
        if (reponse.result.n !== 1 && reponse.result.ok !== 1) {
            return res.json({ type: "erreur", message: "Erreur lors de la création du thème" })
        }
        return res.json(reponse.ops[0]);
    })

    // Sélectionner tous les thèmes

    app.get("/api/themes/all", async (req, res) => {
        const reponse = await themeClass.getAllThemes();
        return res.json(reponse);
    })

    // Modifier un thème

    app.put('/api/themes', async (req, res) => {
        const data = req.body;
        const v = new Validator(data, {
            themeId: 'required|string|checkObjectid',
            theme: 'required|string'
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(400).json(v.errors);
        }
        const reponse = await themeClass.editTheme(data.themeId, data.theme)
        return res.json(reponse);
    })

    app.delete('/api/themes/:_id', async(req, res) => {
        const v = new Validator(data, {
            _id: 'required|string|checkObjectid'
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(400).json(v.errors);
        }
    })
}

module.exports = themes;