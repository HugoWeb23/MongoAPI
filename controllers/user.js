const { Db, ObjectID, ObjectId } = require("mongodb");
const User = require('../classes/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const dotenv = require('dotenv');
const { addCustomMessages, extend, Validator } = require('node-input-validator');

addCustomMessages({
    'checkObjectid': "Le format de l'ObjectID n'est pas valide",
    'userId.required': "Veuillez saisir un ID utilisateur",
    'nom.required': "Veuillez saisir un nom",
    'prenom.required': "Veuillez saisir un prénom",
    'email.required': "Veuillez saisir une adresse e-mail",
    'email.email': "L'adresse e-mail n'est pas valide",
    'pass.required': "Veuillez saisir un mot de passe",
    'admin.required': "Le grade de l'utilisateur est obligatoire",
    'admin.boolean': "Le grade de l'utilisateur n'est pas valide",
    'admin.pass': "Veuillez saisir un mot de passe"
})

const users = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error("Invalid Database");
    }

// Vérifie si un ObjectID est valide
extend('checkObjectid', ({ value }, validator) => {
    if (ObjectID.isValid(value) === false) {
        return false;
    }
    return true;
})

    const userClass = new User(db);

    app.post("/register", async (req, res) => {
        const data = req.body;

        const v = new Validator(data, {
            nom: 'required|string',
            prenom: 'required|string',
            email: 'required|email',
            admin: 'required|boolean',
            pass: 'required|string'
        })

        const matched = await v.check();

        if (!matched) {
            return res.json(v.errors);
        }

        data.pass = await bcrypt.hash(data.pass, 10);
        data.admin = data.admin === "true";
        const reponse = await userClass.createUser(data);
        const user = reponse.ops[0]
        const token = jwt.sign({ id: reponse.ops[0]._id }, process.env.secretKey, {
            expiresIn: 432000
        });
        user.token = token
        delete user.pass
        return res.json(user);
    })

    app.post('/login', async (req, res) => {
        const data = req.body;
        const v = new Validator(data, {
            email: 'required|email',
            pass: 'required|string',
        })

        const matched = await v.check();

        if (!matched) {
            const errors = {}
            for(const [key, value] of Object.entries(v.errors)) {
               errors[key] = value;
            }
            return res.status(400).json(errors);
        }
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
                    expiresIn: 432000
                });
                user.token = token
                return res.json(user)
            })
        })(req, res)
    })

    app.post('/api/user/update', async(req, res) => {

        const data = req.body;

        const v = new Validator(data, {
            _id: 'required|checkObjectid',
            nom: 'required|string',
            prenom: 'required|string',
            email: 'required|email',
            admin: 'required|boolean',
            pass: 'string'
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(400).json(v.errors);
        }
        data.pass ? data.pass = await bcrypt.hash(data.pass, 10) : null;
        data.admin = data.admin === "true";
        const {lastErrorObject, value} = await userClass.updateUser(data);
        if(lastErrorObject.n != 1) {
            return res.status(400).json({type: "error", message: "Aucun utilisateur n'a été trouvé"})
        } else {
            return res.status(200).json(value);
        }

    })

    app.get('/api/user', (req, res) => {
        return res.json(req.user)
    })
}

module.exports = users;