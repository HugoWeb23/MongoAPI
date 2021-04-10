import express from 'express';
import { getDb } from './database/connexion.js';

// Controllers
import { users } from './controllers/users.js';
import { questions } from './controllers/question.js'
import { themes } from './controllers/theme.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

(async () => {
    const db = await getDb();

    users(app, db);
    questions(app, db);
    themes(app, db);

    app.listen(port, () => {
        console.log(`Application lancée sur le port: ${port}`)
    });
})();