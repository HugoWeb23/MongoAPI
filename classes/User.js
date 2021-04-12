const { ObjectId } = require('mongodb');

class User {
    constructor(db) {
        this.db = db;
        this.userCollection = this.db.collection('utilisateurs');
    }

    async createUser(data) {
        const user = await this.userCollection.insertOne(data);
        return user;
    }

}

module.exports = User;