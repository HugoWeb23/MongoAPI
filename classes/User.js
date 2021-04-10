import { default as mongodb } from 'mongodb';
const ObjectID = mongodb.ObjectID;

export class User {
    constructor(db) {
        this.db = db;
        this.userCollection = this.db.collection("users");
    }

    async fetchUser(id_user) {
        let _id = new ObjectID(id_user);
        const user = await this.userCollection.findOne({ _id });
        return user;
    }
}