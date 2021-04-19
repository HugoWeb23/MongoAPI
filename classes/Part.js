const { ObjectId, ObjectID } = require('mongodb');

module.exports = class Part {
    constructor(db) {
        this.db = db;
        this.partCollection = this.db.collection('parties');
    }

    async createPart(data) {
        this.partCollection.insertOne({
            userId: new ObjectID("6078708a55d5264ae8c62aac"),
            date: new Date(),
            questions: data
        })
    }

    async updatePart(data) {
        const reponse = {}
        reponse['questions.$.correcte'] = data.correcte
        ObjectID.isValid(data.reponse) == false ? reponse['questions.$.reponse'] = data.reponse : reponse['questions.$.propositionId'] = data.reponse;
        this.partCollection.updateOne({
            _id: new ObjectID(data.id_part),
            'questions.questionId': new ObjectID(data.id_question)
        }, 
        {
            $set: reponse
        })
    }
}