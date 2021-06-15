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
            return res.status(422).json({errors: v.errors});
        }
        const reponse = await themeClass.createTheme(data);
        if (reponse.result.n !== 1 && reponse.result.ok !== 1) {
            return res.json({ type: "erreur", message: "Erreur lors de la création du thème" })
        }
        return res.status(200).json(reponse.ops[0]);
    })

    // Sélectionner tous les thèmes avec pagination

    app.get("/api/themes/all", async (req, res) => {
        const data = req.query
        const v = new Validator(data, {
           limit: 'required|integer',
           page: 'required|integer'

       })
       const matched = await v.check();
   
       if (!matched) {
           return res.status(422).json(v.errors);
       }

        let reponse = await themeClass.getAllThemes();
        const NumberOfPages = Math.ceil(reponse.length / data.limit);
        if(data.page > NumberOfPages) {
            data.page = NumberOfPages
        }
        const IndexMax = data.page * data.limit;
        const IndexMin = IndexMax - data.limit;
        const infos = {}
        infos.totalPages = NumberOfPages
        infos.currentPage = parseInt(data.page, 10)
        infos.elementsPerPage = parseInt(data.limit, 10)
        reponse = reponse.slice(IndexMin, IndexMax);
        return res.json({...infos, allThemes: reponse});
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
        const v = new Validator(data, {
            _id: 'required|string|checkObjectid',
            theme: 'required|string'
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(422).json({errors: v.errors});
        }
        const reponse = await themeClass.editTheme(data._id, data.theme)
        if(reponse == null) {
            return res.status(422).json({errors: {message: 'Une erreur est survenue'}})
        }
        return res.status(200).json(reponse);
    })

    app.post('/api/themes/search', async(req, res) => {
        const theme = req.body.theme
        const themes = await themeClass.searchTheme(theme)
        return res.status(200).json(themes)
    })

    app.delete('/api/themes/:_id', async(req, res) => {
        const data = req.params;
        const v = new Validator(data, {
            _id: 'required|string|checkObjectid'
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(422).json(v.errors);
        }

        const reponse = await themeClass.deleteTheme(data._id);
        if(reponse.result.n != 1) {
            return res.status(422).json({type: 'error', message: "Le thème n'existe pas"})
        }
        return res.status(200).json({type: 'success', message: "Le thème a été supprimé"})
    })
}

module.exports = themes;