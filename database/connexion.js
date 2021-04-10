import { default as mongodb } from 'mongodb';
import dotenv from 'dotenv';
let MongoClient = mongodb.MongoClient;
import { userConstraints } from '../constraints/userConstraints.js';
import { questionConstraints } from '../constraints/questionConstraints.js';
import { themeConstraints } from '../constraints/themeConstraints.js';

dotenv.config();
const prod = process.env.prodURL;
const dev = "mongodb://localhost:27017"
const isProduction = false;
const dbName = "hugo";

export const getDb = async () => {
  let db;
  try {
    const client = await MongoClient.connect(isProduction ? prod : dev, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = client.db(dbName);
    await userConstraints(db);
    await questionConstraints(db);
    await themeConstraints(db);
  } catch (error) {
    console.error(error);
  }

  return db;
};
