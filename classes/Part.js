const { ObjectId, ObjectID } = require('mongodb');
let dateFormat = require('dateformat');

module.exports = class Part {
    constructor(db) {
        this.db = db;
        this.partCollection = this.db.collection('parties');
    }

    async createPart(data, UserId) {
        const part = await this.partCollection.insertOne({
            userId: new ObjectID(UserId),
            date: dateFormat(new Date(), "dd/mm/yyyy HH:MM:ss"),
            startingTime: new Date().getTime(),
            questions: data
        })
        return part;
    }

    async updatePart(data, type) {
        const reponse = {}
        reponse['questions.$.correcte'] = data.correcte
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
        const lastQuestion = await this.partCollection.aggregate([
            {$match: {_id: ObjectID(data.id_part)}},
            { $project: { questions: { $slice: [ "$questions", -1 ] } } }
        ]).toArray()
        const {questionId} = lastQuestion[0]?.questions[0]
        if(questionId == data.id_question) {
            this.partCollection.updateOne({
                _id: ObjectID(data.id_part)
            }, 
            {
                $set: {endingTime: new Date().getTime()}
            })
        }
    }

    async deletePart(id_part) {
        const part = await this.partCollection.deleteOne({
            _id: ObjectID(id_part)
        })
        return part;
    }

    async getUserAllParts(UserId) {
        const allParts = await this.partCollection.aggregate([
            {$match: {userId: ObjectID(UserId)}},
            {$addFields: {
                totalQuestions: { $size: "$questions" },
                trueQuestions: { $size: {
                    $filter: {
                       input: "$questions",
                       as: "question",
                       cond: { $eq: [ "$$question.correcte", true ] }
                    }
                 }},
                 falseQuestions: { $size: {
                    $filter: {
                       input: "$questions",
                       as: "question",
                       cond: { $eq: [ "$$question.correcte", false ] }
                    }
                 }},
            }},
            {$addFields: {
                questionsAnswered: { $add : [ 
                    '$falseQuestions', '$trueQuestions' 
                ]}
            }},
            {$addFields: {
                isFinished: { $eq: ["$totalQuestions", "$questionsAnswered"] },
            }},
        {$project: {totalQuestions: 1, startingTime: 1, endingTime: 1, trueQuestions: 1, falseQuestions: 1, date: 1, isFinished: 1}}
        ]).toArray();
        return allParts;
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
        {$addFields : {
            totalQuestions: {$size: "$questions"},
            trueQuestions: { $size: {
                $filter: {
                   input: "$questions",
                   as: "question",
                   cond: { $eq: [ "$$question.correcte", true ] }
                }
             }},
            questions: 
            {$map : {
                input : "$questions", 
                as : "e", 
                in : {$mergeObjects: [
                    "$$e",
                    {$arrayElemAt :[{$filter : {input : "$OriginalQuestions", as : "j", cond : {$eq :["$$e.questionId", "$$j._id"]}}},0]}
                    ]
                }}}
        }},
        {$project : {'OriginalQuestions': 0, 'userId': 0, 'questions.questionId': 0}}
        ]).toArray();

        return part[0]
    }

    // Récupérer les questions d'une partie en cours

    async partQuestions(_id) {
        const part = await this.partCollection.aggregate([
        {$match: {_id: ObjectID(_id)}},
        {
            $addFields: {
                    totalQuestions: {$size: "$questions"},
                    filterQuestions: {
                        $filter: {
                           input: "$questions",
                           as: "question",
                           cond: {$and: [ {$ne: [ "$$question.correcte", false ]},  {$ne: [ "$$question.correcte", true ]},]}
                        }
                     },
                    
            }
        },
        {
            $lookup:
            {
                from: "questions",
                localField: "filterQuestions.questionId",
                foreignField: "_id",
                as: "FindQuestions"
            }
        },
        {
            $addFields: {
                AllQuestions: 
                {$map : {
                    input : "$filterQuestions", 
                    as : "e", 
                    in : {$mergeObjects: [
                        "$$e",
                        {$arrayElemAt :[{$filter : {input : "$FindQuestions", as : "j", cond : {$eq :["$$e.questionId", "$$j._id"]}}},0]}
                        ]
                    }}},
                    firstQuestion: {$first: "$filterQuestions"},
                    trueQuestions: { $size: {
                        $filter: {
                           input: "$questions",
                           as: "question",
                           cond: { $eq: [ "$$question.correcte", true ] }
                        }
                     }},
                   
            },
        },
        {
                $addFields: {
                    index: { $indexOfArray: [ "$questions.questionId",  "$firstQuestion.questionId"] },
                }
        },
        {
            $addFields: {
                currentIndex: { $add : [ 
                    '$index', 1
                ]},
                id_part: '$_id'
            }
        },
        {$project : {
            'questions': 0,
            'filterQuestions': 0,
            'FindQuestions': 0,
            'index': 0,
            'firstQuestion': 0,
            'AllQuestions.reponse': 0, 
            'AllQuestions.propositions.correcte': 0}}
        ]).toArray();

        return part[0]
    }
}