const { Db, ObjectID } = require("mongodb");
const User = require('../classes/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const dotenv = require('dotenv');

const users = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error("Invalid Database");
    }

    const userClass = new User(db);

    app.post("/users/new", async (req, res) => {
        const data = req.body;
        data.pass = await bcrypt.hash(data.pass, 10);
        data.admin = data.admin === "true";
        const reponse = await userClass.createUser(data);
        const token = jwt.sign({ id: reponse.ops[0]._id }, process.env.secretKey, {
            expiresIn: 8000 // expires in 24 hours
        });
        return res.json({ auth: true, token: token });
    })

    app.get("/users/me", (req, res) => {
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, "supersecret", function (err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            res.status(200).send(decoded);
        });
    })

    app.post('/login', async (req, res) => {
        passport.authenticate('local', { session: false }, (err, user) => {
            if (err || !user) {
                return res.status(400).json({ type: 'erreur', message: 'Adresse e-mail ou mot de passe incorrect' })
            }

            req.login(user, { session: false }, (err) => {
                if (err) {
                    res.json({ type: 'erreur', message: 'Erreur lors de l\'identification' })
                }
                delete user.pass;
                const token = jwt.sign(user, process.env.secretKey, {
                    expiresIn: 8000
                });

                return res.json({ user, token })
            })
        })(req, res)
    })
}

module.exports = users;