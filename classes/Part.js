const { ObjectId, ObjectID } = require('mongodb');

module.exports = class Part {
    constructor(db) {
        this.db = db;
        this.partCollection = this.db.collection('parties');
    }

    async createPart(data) {
        const part = await this.partCollection.insertOne({
            userId: new ObjectID("6078708a55d5264ae8c62aac"),
            date: new Date(),
            questions: data
        })
        return part;
    }

    async updatePart(data, type) {
        const reponse = {}
        reponse['questions.$.correcte'] = data.correcte
        //ObjectID.isValid(data.reponse) == false ? reponse['questions.$.reponse'] = data.reponse : reponse['questions.$.propositionId'] = data.reponse;
        if(type === 1) {
            reponse['questions.$.reponseEcrite'] = data.reponseEcrite
        } else if(type === 2) {
            reponse['questions.$.propositionsSelect'] = data.propositionsSelect
        }
        this.partCollection.updateOne({
            _id: ObjectID(data.id_part),
            'questions.questionId': ObjectID(data.id_question)
        }, 
        {
            $set: reponse
        })
    }

    async deletePart(id_part) {
        const part = await this.partCollection.deleteOne({
            _id: ObjectID(id_part)
        })
        return part;
    }

    async partResults(_id) {
        const part = await this.partCollection.aggregate([
        {$match: {_id: ObjectID(_id)}},
        {
            $lookup:
            {
                from: "questions",
                localField: "questions.questionId",
                foreignField: "_id",
                as: "OriginalQuestions"
            }
        },
        {$addFields : {questions: 
            {$map : {
                input : "$questions", 
                as : "e", 
                in : {$mergeObjects: [
                    "$$e",
                    {$arrayElemAt :[{$filter : {input : "$OriginalQuestions", as : "j", cond : {$eq :["$$e.questionId", "$$j._id"]}}},0]}
                    ]
                }}}
        }},
        {$project : {OriginalQuestions: 0, 'userId': 0, 'questions.questionId': 0}}
        ]).toArray();

        return part
    }
}