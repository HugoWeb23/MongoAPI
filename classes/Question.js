const { ObjectId, ObjectID } = require('mongodb');

class Question {
    constructor(db) {
        this.db = db;
        this.questionCollection = this.db.collection('questions');
    }

    async createQuestion(data) {
        const result = await this.questionCollection.insertOne(data);
        return result;
    }

    async getAllQuestions() {
        const result = await this.questionCollection.aggregate([
            {
                $lookup:
                {
                    from: "themes",
                    localField: "themeId",
                    foreignField: "_id",
                    as: "theme"
                }
            },
            { $unwind: '$theme' },
            { $project: { themeId: 0 } }
        ]).toArray();

        return result;
    }

    async getAllQuestionsByTheme(theme) {
        const themeID = ObjectID(theme);
        const result = await this.questionCollection.aggregate([
            { $match: { themeId: themeID } },
            {
                $lookup:
                {
                    from: "themes",
                    localField: "themeId",
                    foreignField: "_id",
                    as: "theme"
                }
            },
            { $unwind: '$theme' },
            { $project: { themeId: 0 } }
        ]).toArray();
        return result;
    }

    async checkReply(data) {
        data.id_question = ObjectID(data.id_question);
        if (data.type === 1) {
            const question = await this.questionCollection.findOne({ _id: data.id_question });
            if (question === null) {
                throw "La question n'existe pas"
            }
            const reponse = question.reponse
            return data.reponse === reponse;
        } else if (data.type === 2) {
            const question = await this.questionCollection.aggregate([
                { $match: { _id: data.id_question } },
                { $project: { propositions: 1, _id: 0 } },
            ]).toArray()
            if (question === null) {
                throw "La question n'existe pas"
            }
            // Récupère la proposition correcte dans le tableau des propositions
            const correctProposition = question[0].propositions.filter(i => i.correcte === true);
            // Détermine si l'ObjectID passé en réponse correpond à l'ObjectID de la proposition correcte
            return ObjectID(data.reponse).equals(correctProposition[0]._id)
        }
    }
}

module.exports = Question;