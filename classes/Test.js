const { ObjectId } = require('mongodb');

class Test {
    constructor(db) {
        this.db = db;
        this.testCollection = this.db.collection("test");
    }

    async fetchUser(id_user) {
        let _id = new ObjectID(id_user);
        const user = await this.testCollection.findOne({ _id });
        return user;
    }
}

module.exports = Test;