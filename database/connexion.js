const dotenv = require('dotenv');
const MongoClient = require("mongodb").MongoClient;
const testConstraints = require('../constraints/testConstraints');
const questionConstraints = require('../constraints/questionConstraints');
const themeConstraints = require('../constraints/themeConstraints');
const userConstraints = require('../constraints/userConstraints');
const partConstraints = require('../constraints/partConstraints');

dotenv.config();
const prod = process.env.prodURL;
const dev = "mongodb://localhost:27033"
const isProduction = true;
const dbName = "hugo";

const getDb = async () => {
  let db;
  try {
    const client = await MongoClient.connect(isProduction ? prod : dev, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = client.db(dbName);
    await testConstraints(db);
    await themeConstraints(db);
    await questionConstraints(db);
    await userConstraints(db);
    await partConstraints(db);
  } catch (error) {
    console.error(error);
  }

  return db;
};

module.exports = getDb;