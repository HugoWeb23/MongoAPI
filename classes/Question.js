const { ObjectId, ObjectID } = require('mongodb');
const Part = require('../classes/Part');

class Question {
    constructor(db) {
        this.db = db;
        this.questionCollection = this.db.collection('questions');
        this.partClasse = new Part(this.db);
    }

    async createQuestion(data) {
        const result = await this.questionCollection.insertOne(data);
        return result;
    }

    async updateQuestion(data) {
        const {_id, type, intitule, themeId, question, reponse = null, propositions} = data;
        const updateValues = {type,
            intitule,
            themeId,
            question}
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

            if(type === 2) {
            const {value} = await this.questionCollection.findOneAndUpdate({
                _id: ObjectID(_id)
            },
                {
                    $set: {propositions},
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

    async checkReply(data) {
        if (data.type === 1) {
            const question = await this.questionCollection.findOne({ _id: data.id_question });
            if (question === null) {
                throw "La question n'existe pas"
            }
            const reponse = question.reponse
            data.correcte = data.reponse === reponse;
            // Enregistrement de la réponse dans la partie
            await this.partClasse.updatePart(data);
            return data.reponse === reponse;
        } else if (data.type === 2) {
            const question = await this.questionCollection.aggregate([
                { $match: { _id: ObjectID(data.id_question) } },
                { $project: { propositions: 1, _id: 0 } },
            ]).toArray()
            if (question === null) {
                throw "La question n'existe pas"
            }
            // Récupère la proposition correcte dans le tableau des propositions
            const correctProposition = question[0].propositions.filter(i => i.correcte === true);
            // Détermine si l'ObjectID passé en réponse correpond à l'ObjectID de la proposition correcte
            data.correcte = ObjectID(data.reponse).equals(correctProposition[0]._id);
            data.reponse = new ObjectID(data.reponse);
             // Enregistrement de la réponse dans la partie
            await this.partClasse.updatePart(data);
            return ObjectID(data.reponse).equals(correctProposition[0]._id)
        }
    }

    /**
     * @param {Object} data
     */
    async getQuestions(data = {}) {
        const rules = [
            { $lookup: {
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
            data.types ? search['type'] = {$in: data.types} : null; 
            // Si le tableau de thèmes à rechercher contient au moins une valeur, on l'ajoute dans l'objet search
            data.themes ? search['themeId'] = {$in: data.themes} : null;
            data.questions ? search['_id'] = {$in: data.questions} : null;
            // Si l'objet search n'est pas vide, on ajoute la propriété match dans l'aggregate en lui passant l'objet search
            Object.keys(search).length > 0 ? rules.unshift({$match: search}) : null;

            data.limit ? rules.splice(1, 0, {$limit: data.limit}) : null;
            // Si random vaut true, on sélectionne les documents de façon aléatoire, avec une limite définie par data.limit, ou 9999 si aucune limite n'est fournie
            data.random == 'true' ? rules.splice(2, 0, {$sample: {size: data.limit || 9999}}) : null;
     
        const questions = await this.questionCollection.aggregate(rules).toArray();
        return questions;
    }

    async deleteQuestion(id) {
        const question = this.questionCollection.deleteOne({
            _id: ObjectID(id)
        })
        return question;
    }
}

module.exports = Question;