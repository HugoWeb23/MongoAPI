const { ObjectId } = require('mongodb');


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
            _id: theme
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
}

module.exports = Theme;