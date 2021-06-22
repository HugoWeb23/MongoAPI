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

    async emailIsAvailable(data) {
        const email = await this.userCollection.findOne({
            email: data
        })
        return email != null ? false : true;
    }

    async getUser(_id) {
        const user = await this.userCollection.findOne({
            _id: ObjectID(_id)
        })
        return user;
    }

    async getAllUers() {
        const users = await this.userCollection.aggregate([
            {$project: {pass: 0}}
        ]).toArray()
        return users;
    }

    async deleteUser(_id) {
        const user = await this.userCollection.deleteOne({
            _id: ObjectID(_id)
        })
        return user
    }

    async updateUser(user) {
        const { value } = await this.userCollection.findOneAndUpdate({
            _id: ObjectID(user._id)
        },
            {
                $set: {
                    'nom': user.nom,
                    'prenom': user.prenom,
                    'email': user.email,
                    'admin': user.admin
                }
            },
            {
                returnOriginal: false
            })
        return value
    }

}

module.exports = User;