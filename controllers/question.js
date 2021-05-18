const { Db, ObjectID } = require("mongodb");
const Question = require('../classes/Question');
const { addCustomMessages, extend, Validator } = require('node-input-validator');

// Erreurs de validation
addCustomMessages({
    'type.required': "Le type est obligatoire",
    'type.integer': "Le type de question n'est pas valide",
    'intitule.required': "L'intitulé est obligatoire",
    'themeId.required': "Le thème est obligatoire",
    'checkObjectid': "Le format de l'ObjectID n'est pas valide",
    'checkResponseType': "La réponse doit être un ObjectID valide",
    'question.required': "La question est obligatoire",
    'propositions.requiredIf': "Veuillez saisir au moins une proposition",
    'propositions.array': "Le format des propositions n'est pas valide",
    'reponse.requiredIf': "Veuillez saisir une réponse",
    'types.array': "Le ou les types de questions à chercher doivent être passés dans un tableau",
    'types.*.integer': "Les types de questions ne sont pas valides",
    'themes.array': "Le ou les types de thèmes à chercher doivent être passés dans un tableau",
    'propositions.*.proposition': "La proposition est obligatoire"
})

// Vérifie si un ObjectID est valide
extend('checkObjectid', ({ value }, validator) => {
    if (ObjectID.isValid(value) === false) {
        return false;
    }
    return true;
})

const questions = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error("Invalid Database");
    }

    const questionClass = new Question(db);

    // Créer une nouvelle question

    app.post("/api/questions/new", async (req, res) => {
        const data = req.body;
        const v = new Validator(data, {
            type: 'required|integer',
            intitule: 'required|string',
            themeId: 'required|string|checkObjectid', // checkObjectid: vérifie si un ObjectID est valide
            question: 'required|string',
            reponse: 'requiredIf:type,1|string', // Obligatoire si le type de la question vaut 1
            propositions: 'requiredIf:type,2|array', // Obligatoire si le type de la question vaut 2
            'propositions.*.proposition': 'requiredIf:type,2|string'
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(422).json({errors: v.errors});
        }

        data.type = parseInt(data.type, 10);
        data.themeId = new ObjectID(data.themeId);

        if(data.type === 1) {
            delete data.propositions;
        } else if(data.type === 2) {
            delete data.reponse;
        }
        
        if(data.propositions) {
            data.propositions = data.propositions.map(i => {
               let prop = {...i, _id: new ObjectID()} // Ajout d'un ID dans les propositions
                return prop;
            })
        }

        const reponse = await questionClass.createQuestion(data);
       
        return res.status(200).json(...reponse);
    })

    // Mettre à jour une question

    app.put('/api/questions/:_id', async(req, res) => {
        const data = req.body;
        data._id = req.params._id;
        const v = new Validator(data, {
            _id: 'required|string|checkObjectid',
            type: 'required|integer',
            intitule: 'required|string',
            themeId: 'required|string|checkObjectid', // checkObjectid: vérifie si un ObjectID est valide
            question: 'required|string',
            reponse: 'requiredIf:type,1|string', // Obligatoire si le type de la question vaut 1
            propositions: 'requiredIf:type,2|array', // Obligatoire si le type de la question vaut 2
            'propositions.*.proposition': 'requiredIf:type,2|string'
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(422).json({errors: v.errors});
        }

        data.type = parseInt(data.type, 10);
        data.themeId = new ObjectID(data.themeId);

        if(data.type === 1) {
            delete data.propositions;
        } else if(data.type === 2) {
            delete data.reponse;
        }

        if(data.propositions) {
            data.propositions = data.propositions.map(i => {
               let prop = {...i, _id: new ObjectID()} // Ajout d'un ID dans les propositions
                return prop;
            })
        }
        let reponse = await questionClass.updateQuestion(data);
        return res.json(...reponse);
    })

    // Récupérer toutes les questions

    app.get("/api/questions/all", async (req, res) => {
        const reponse = await questionClass.getAllQuestions();
        return res.json(reponse);
    })

    // Récupérer toutes les questions en rapport avec plusieurs thèmes

    app.post("/api/questions", async (req, res) => {
        const data = req.body;
        const v = new Validator(data, {
            themes: 'required|array',
            'themes.*': 'checkObjectid'
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(422).json(v.errors);
        }

        data.themes = data.themes.map(t => new ObjectID(t));
        const reponse = await questionClass.getQuestionsByThemes(data.themes);
        return res.status(200).json(reponse);
    })

    // Récupérer toutes les questions en fonction de l'ID d'un thème

    app.get('/api/:themeID/questions', async (req, res) => {
        const v = new Validator(req.params, {
            themeID: 'required|string|checkObjectid', // checkObjectid: vérifie si un ObjectID est valide
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(422).json(v.errors);
        }
        const { themeID } = req.params;
        const questions = await questionClass.getAllQuestionsByTheme(themeID);
        return res.json(questions);
    })

    // Vérifier si une réponse est correcte

    // Vérifie que la réponse est un ObjectID si le type est égal à 2
    extend('checkPropsType', ({ value, args }, validator) => {
      
        return true;
    })

    app.post('/api/questions/checkreply', async (req, res) => {
        const data = req.body;
        const v = new Validator(data, {
            id_part: 'required|string|checkObjectid', // checkObjectid: vérifie si un ObjectID est valide
            id_question: 'required|string|checkObjectid', // checkObjectid: vérifie si un ObjectID est valide
            type: 'required|integer',
            reponseEcrite: 'requiredIf:type,1',
            propositionsSelect: 'requiredIf:type,2|checkPropsType'
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(422).json(v.errors);
        }
        data.type = parseInt(data.type, 10);
        data.reponseEcrite ? data.reponseEcrite = data.reponseEcrite.toLowerCase() : null;
        try {
            const reponse = await questionClass.checkReply(data);
            return res.json({ isCorrect: reponse });
        } catch (e) {
            return res.json({ erreur: e });
        }

    })

    app.delete('/api/question/:id', async(req, res) => {
        const data = req.params;
        const v = new Validator(data, {
            id: 'required|string|checkObjectid'
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(422).json(v.errors);
        }
        const question = await questionClass.deleteQuestion(data.id);
        if(question.result.n != 1) {
            return res.status(422).json({type: 'error', message: "La question n'existe pas"})
        }
        return res.status(200).json({type: 'success', message: "La question a été supprimée"})
    })
}

module.exports = questions;