const express = require('express');
const getDb = require('./database/connexion');

// Controllers
const test = require('./controllers/test');
const questions = require('./controllers/question');
const themes = require('./controllers/theme');
const users = require('./controllers/user');
const part = require('./controllers/part');
const { myPassportLocal, myPassportJWT } = require('./passport');
const passport = require('passport');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(cors());

(async () => {
    app.use('^/api', passport.authenticate('jwt', { session: false }))
    const db = await getDb();

    myPassportLocal(db);
    myPassportJWT(db);

    test(app, db);
    questions(app, db);
    themes(app, db);
    users(app, db);
    part(app, db);

    app.listen(port, () => {
        console.log(`Application lancée sur le port: ${port}`)
    });
})();