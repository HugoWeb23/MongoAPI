const { Db, ObjectID } = require("mongodb");
const Theme = require('../classes/Theme');
const { addCustomMessages, extend, Validator } = require('node-input-validator');
const Paginate = require('../services/Paginate')
const Validation = require('../services/Validation')

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
        const rules = {
            theme: 'required|string'
        }
        try {
            await Validation(data, rules)
            const reponse = await themeClass.createTheme(data);
            if (reponse.result.n !== 1 && reponse.result.ok !== 1) {
                return res.json({ type: "erreur", message: "Erreur lors de la création du thème" })
            }
            return res.status(200).json(reponse.ops[0]);
        } catch (e) {
            return res.status(422).json({ errors: e });
        }
    })

    // Sélectionner tous les thèmes avec pagination

    app.get("/api/themes/all", async (req, res) => {
        const data = req.query
        const rules = {
            limit: 'required|integer',
            page: 'required|integer'
        }
        try {
            await Validation(data, rules)
            let reponse = await themeClass.getAllThemes();
            const { infos, elements } = Paginate(reponse, data.limit, data.page)
            return res.json({ ...infos, allThemes: elements });
        } catch (e) {
            return res.status(422).json({ errors: e });
        }
    })

    // Sélectionner tous les thèmes sans pagination

    app.get("/api/themes", async (req, res) => {
        const reponse = await themeClass.getAllThemes();
        return res.status(200).json(reponse);
    })

    // Modifier un thème

    app.put('/api/themes/:_id', async (req, res) => {
        const data = req.body;
        data._id = req.params._id;
        const rules = {
            _id: 'required|string|checkObjectid',
            theme: 'required|string'
        }

        try {
            await Validation(data, rules)
            const reponse = await themeClass.editTheme(data._id, data.theme)
            if (reponse == null) {
                return res.status(422).json({ errors: { message: 'Une erreur est survenue' } })
            }
            return res.status(200).json(reponse);
        } catch (e) {
            return res.status(422).json({ errors: v.errors });
        }
    })

    app.post('/api/themes/search', async (req, res) => {
        const theme = req.body.theme
        const themes = await themeClass.searchTheme(theme)
        return res.status(200).json(themes)
    })

    app.delete('/api/themes/:_id', async (req, res) => {
        const data = req.params;
        const rules = {
            _id: 'required|string|checkObjectid'
        }

        try {
            await Validation(data, rules)
            const reponse = await themeClass.deleteTheme(data._id);
            if (reponse.result.n != 1) {
                return res.status(422).json({ type: 'error', message: "Le thème n'existe pas" })
            }
            return res.status(200).json({ type: 'success', message: "Le thème a été supprimé" })
        } catch (e) {
            return res.status(422).json({ errors: v.errors });
        }
    })
}

module.exports = themes;