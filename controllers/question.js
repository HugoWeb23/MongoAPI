const { Db, ObjectID } = require("mongodb");
const Question = require('../classes/Question');

const questions = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error("Invalid Database");
    }

    const questionClass = new Question(db);

    app.post("/questions/new", async (req, res) => {
        const data = req.body;
        data.type = parseInt(data.type, 10);
        data.themeId = new ObjectID(data.themeId);
        data.propositions = data.propositions.map(i => {
            let temp = Object.assign({}, i);
            temp.correcte = temp.correcte === "true";
            temp._id = new ObjectID()
            return temp;
        })
        const reponse = await questionClass.createQuestion(data);
        if (reponse.result.n !== 1 && reponse.result.ok !== 1) {
            return res.json({ type: "erreur", message: "Erreur lors de la création de la question" })
        }
        return res.json(reponse.ops[0]);
    })

    app.get("/api/questions/all", async (req, res) => {
        const reponse = await questionClass.getAllQuestions();
        return res.json(reponse);
    })
}

module.exports = questions;