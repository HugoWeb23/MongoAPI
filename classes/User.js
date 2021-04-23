const { ObjectId, ObjectID } = require('mongodb');

class User {
    constructor(db) {
        this.db = db;
        this.userCollection = this.db.collection('utilisateurs');
    }

    async createUser(data) {
        const user = await this.userCollection.insertOne(data);
        return user;
    }

    async updateUser(data) {
        const {_id, nom, prenom, email, admin, pass} = data;
        const updateValues = { nom, prenom, email, admin }
        pass ? updateValues.pass = pass : null;
        const value = await this.userCollection.findOneAndUpdate({
            _id: ObjectID(_id)
        },
        {
            $set: updateValues
        },
        {
            projection: {"pass": 0},
            returnOriginal: false
        })
        return value;
    }

}

module.exports = User;