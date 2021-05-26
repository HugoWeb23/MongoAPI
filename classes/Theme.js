const { ObjectId, ObjectID } = require('mongodb');


class Theme {
    constructor(db) {
        this.db = db;
        this.themeCollection = this.db.collection('themes');
    }

    async createTheme(data) {
        const result = await this.themeCollection.insertOne(data);
        return result;
    }

    async getAllThemes() {
        const result = await this.themeCollection.find().toArray();
        return result;
    }

    async editTheme(theme, data) {
        const { value } = await this.themeCollection.findOneAndUpdate({
            _id: ObjectID(theme)
        },
            {
                $set: {
                    'theme': data
                }
            },
            {
                returnOriginal: false
            })
        return value
    }

    async searchTheme(theme) {
        const themes = await this.themeCollection.find({
            "theme": new RegExp(theme, 'i')
        }).toArray()
        return themes;
    }

    async deleteTheme(_id) {
        const theme = await this.themeCollection.deleteOne({
            _id: ObjectID(_id)
        })
        return theme;
    }
}

module.exports = Theme;