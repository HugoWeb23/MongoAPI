import { default as mongodb } from 'mongodb';
const ObjectID = mongodb.ObjectID;


export class Question {
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
}