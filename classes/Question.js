const { ObjectId, ObjectID } = require('mongodb');
const Part = require('../classes/Part');

class Question {
    constructor(db) {
        this.db = db;
        this.questionCollection = this.db.collection('questions');
        this.partCollection = this.db.collection('parties');
        this.partClasse = new Part(this.db);
    }

    async createQuestion(data) {
        const question = await this.questionCollection.insertOne(data);
        const result = await this.questionCollection.aggregate([
            { $match: { _id: ObjectID(question.ops[0]._id) } },
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

    async updateQuestion(data) {
        const { _id, type, intitule, themeId, question, reponse = null, propositions } = data;
        const updateValues = {
            type,
            intitule,
            themeId,
            question
        }
        reponse != null ? updateValues.reponse = reponse : null;

        const unsetValues = {}
        type === 1 ? unsetValues.propositions = "" : null;
        type === 2 ? unsetValues.reponse = "" : null;

        await this.questionCollection.findOneAndUpdate({
            _id: ObjectID(_id)
        },
            {
                $set: updateValues,

                $unset: unsetValues
            },
            {
                returnOriginal: false
            })

        if (type === 2) {
            const { value } = await this.questionCollection.findOneAndUpdate({
                _id: ObjectID(_id)
            },
                {
                    $set: { propositions },
                },
                {
                    returnOriginal: false
                })
        }
        const result = await this.questionCollection.aggregate([
            { $match: { _id: ObjectID(_id) } },
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

    async getAllQuestions(data) {
        const rules = [
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
        ]
        let search = {}
        data.theme &&= data.theme.map(t => new ObjectID(t))
        data.type &&= data.type.map(t => parseInt(t, 10))
        data.theme && (search.themeId = { $in: data.theme })
        data.type && (search.type = {$in: data.type})
        data.text && (search.question = {'$regex': data.text})
    
        Object.keys(search).length > 0 ? rules.unshift({$match: search}) : null
        const result = await this.questionCollection.aggregate(rules).toArray();
        return result;
    }

    async getAllQuestionsByTheme(theme) {
        const result = await this.questionCollection.aggregate([
            { $match: { themeId: ObjectID(theme) } },
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

    async getQuestionsByThemes(themes) {
        const result = await this.questionCollection.aggregate([
            { $match: { themeId: { $in: themes } } },
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
        if (data.type === 1) {
            const question = await this.questionCollection.findOne({ _id: ObjectID(data.id_question) });
            if (question === null) {
                throw "La question n'existe pas"
            }
            const reponse = question.reponse
            data.correcte = data.reponseEcrite === reponse;
            // Enregistrement de la réponse dans la partie
            await this.partClasse.updatePart(data, data.type);
            return data.reponseEcrite === reponse;
        } else if (data.type === 2) {
            const question = await this.questionCollection.aggregate([
                { $match: { _id: ObjectID(data.id_question) } },
                { $project: { propositions: 1, _id: 0 } },
            ]).toArray()
            if (question === null) {
                throw "La question n'existe pas"
            }
            // Récupère la proposition correctes
            const correctPropositions = question[0].propositions.filter(p => p.correcte);

            data.correcte = (data.propositionsSelect.length === correctPropositions.length && correctPropositions.every(p => data.propositionsSelect.some(prop => prop == p._id)))
            // Enregistrement de la réponse dans la partie
            this.partClasse.updatePart(data, data.type);
            return data.correcte;
        }
    }

    /**
     * @param {Object} data
     */
    async getQuestions(data = {}) {
        const rules = [
            {
                $lookup: {
                    from: "themes",
                    localField: "themeId",
                    foreignField: "_id",
                    as: "theme"
                }
            },
            { $unwind: '$theme' },
            { $project: { themeId: 0, reponse: 0, 'propositions.correcte': 0 } }
        ];
        let search = {}
        // Si le tableau de types à rechercher contient au moins une valeur, on l'ajoute dans l'objet search
        data.types && data.types.length > 0 ? search['type'] = { $in: data.types } : null;
        // Si le tableau de thèmes à rechercher contient au moins une valeur, on l'ajoute dans l'objet search
        data.themes && data.themes.length > 0 ? search['themeId'] = { $in: data.themes } : null;
        data.questions && data.questions.length > 0 ? search['_id'] = { $in: data.questions } : null;
        // Si l'objet search n'est pas vide, on ajoute la propriété match dans l'aggregate en lui passant l'objet search
        Object.keys(search).length > 0 ? rules.unshift({ $match: search }) : null;

        data.limit ? rules.splice(2, 0, { $limit: data.limit }) : null;
        // Si random vaut true, on sélectionne les documents de façon aléatoire, avec une limite définie par data.limit, ou 9999 si aucune limite n'est fournie
        data.random == true ? rules.splice(2, 0, { $sample: { size: data.limit || 9999 } }) : null;

        const questions = await this.questionCollection.aggregate(rules).toArray();
        return questions;
    }

    async deleteQuestion(id) {
        const question = await this.questionCollection.deleteOne({
            _id: ObjectID(id)
        })
        await this.partCollection.updateMany(
            {},
            {$pull: {questions: {questionId: ObjectID(id)}}}
            )
        return question;
    }
}

module.exports = Question;