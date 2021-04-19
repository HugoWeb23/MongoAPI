const { Db, ObjectID } = require("mongodb");
const Question = require('../classes/Question');
const { addCustomMessages, extend, Validator } = require('node-input-validator');

// Erreurs de validation
addCustomMessages({
    'type.required': "Veuillez définir le type de la question",
    'type.integer': "Le type de question n'est pas valide",
    'intitule.required': "Veuillez saisir un intitulé",
    'themeId.required': "Veuillez saisir un thème",
    'checkObjectid': "Le format de l'ObjectID n'est pas valide",
    'checkResponseType': "La réponse doit être un ObjectID valide",
    'question.required': "Veuillez saisir une question",
    'propositions.requiredIf': "Veuillez saisir au moins une proposition",
    'propositions.array': "Le format des propositions n'est pas valide",
    'reponse.requiredIf': "Veuillez saisir une réponse",
    'types.array': "Le ou les types de questions à chercher doivent être passés dans un tableau",
    'types.*.integer': "Les types de questions ne sont pas valides",
    'themes.array': "Le ou les types de thèmes à chercher doivent être passés dans un tableau"
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
            propositions: 'requiredIf:type,2|array' // Obligatoire si le type de la question vaut 2
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(400).json(v.errors);
        }

        data.type = parseInt(data.type, 10);
        data.themeId = new ObjectID(data.themeId);
        if(data.propositions) {
            data.propositions = data.propositions.map(i => {
                let temp = Object.assign({}, i);
                temp.correcte = temp.correcte === "true";
                temp._id = new ObjectID()
                return temp;
            })
        }
    
        const reponse = await questionClass.createQuestion(data);
        if (reponse.result.n !== 1 && reponse.result.ok !== 1) {
            return res.json({ type: "erreur", message: "Erreur lors de la création de la question" })
        }
        return res.json(reponse.ops[0]);
    })

    // Récupérer toutes les questions

    app.get("/api/questions/all", async (req, res) => {
        const reponse = await questionClass.getAllQuestions();
        return res.json(reponse);
    })

    // Récupérer toutes les questions en fonction de l'ID d'un thème

    app.get('/api/:themeID/questions', async (req, res) => {
        const v = new Validator(req.params, {
            themeID: 'required|string|checkObjectid', // checkObjectid: vérifie si un ObjectID est valide
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(400).json(v.errors);
        }
        const { themeID } = req.params;
        const questions = await questionClass.getAllQuestionsByTheme(themeID);
        return res.json(questions);
    })

    // Vérifier si une réponse est correcte

    // Vérifie que la réponse est un ObjectID si le type est égal à 2
    extend('checkResponseType', ({ value, args }, validator) => {
        if (validator.inputs[args[0]] == 2 && ObjectID.isValid(value) === false) {
            return false;
        }
        return true;
    })

    app.post('/api/questions/checkreply', async (req, res) => {
        const data = req.body;
        const v = new Validator(data, {
            id_part: 'required|string|checkObjectid', // checkObjectid: vérifie si un ObjectID est valide
            id_question: 'required|string|checkObjectid', // checkObjectid: vérifie si un ObjectID est valide
            type: 'required|integer',
            reponse: 'required|string|checkResponseType:type' // Vérifie que la réponse est un ObjectID si le type est égal à 2
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(400).json(v.errors);
        }
        data.type = parseInt(data.type, 10);
        data.reponse = data.reponse.toLowerCase();
        try {
            const reponse = await questionClass.checkReply(data);
            return res.json({ isCorrect: reponse });
        } catch (e) {
            return res.json({ erreur: e });
        }

    })
}

module.exports = questions;