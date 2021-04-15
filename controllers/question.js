const { Db, ObjectID } = require("mongodb");
const Question = require('../classes/Question');

const questions = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error("Invalid Database");
    }

    const questionClass = new Question(db);

    // Créer une nouvelle question

    app.post("/api/questions/new", async (req, res) => {
        const data = req.body;
        data.type = parseInt(data.type, 10);
        data.themeId = new ObjectID(data.themeId);
        if (data.propositions > 0) {
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
        const { themeID } = req.params;
        const questions = await questionClass.getAllQuestionsByTheme(themeID);
        return res.json(questions);
    })

    // Vérifier si une réponse est correcte

    app.post('/api/questions/checkreply', async (req, res) => {
        const data = req.body;
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