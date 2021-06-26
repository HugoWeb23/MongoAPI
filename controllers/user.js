const { Db, ObjectID, ObjectId } = require("mongodb");
const User = require('../classes/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const dotenv = require('dotenv');
const { addCustomMessages, extend, Validator } = require('node-input-validator');
const Validation = require('../services/Validation');
const Paginate = require('../services/Paginate')
const { json } = require("express");

addCustomMessages({
    'checkObjectid': "Le format de l'ObjectID n'est pas valide",
    'userId.required': "Veuillez saisir un ID utilisateur",
    'nom.required': "Veuillez saisir un nom",
    'prenom.required': "Veuillez saisir un prénom",
    'email.required': "Veuillez saisir une adresse email",
    'email.email': "L'adresse email n'est pas valide",
    'email.checkEmail': "Cette adresse email est déjà utilisée",
    'email.checkUpdateEmail': "Cette adresse email est déjà utilisée",
    'pass.required': "Veuillez saisir un mot de passe",
    'admin.required': "Le grade de l'utilisateur est obligatoire",
    'admin.boolean': "Le grade de l'utilisateur n'est pas valide",
    'admin.pass': "Veuillez saisir un mot de passe"
})

const users = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error("Invalid Database");
    }

    const userClass = new User(db);

    // Vérifie si un ObjectID est valide
    extend('checkObjectid', ({ value }, validator) => {
        if (ObjectID.isValid(value) === false) {
            return false;
        }
        return true;
    })

    // Vérifie si une adresse email est disponible
    extend('checkEmail', async ({ value }) => {
        return await userClass.emailIsAvailable(value); // True ou false
    })

    extend('checkUpdateEmail', async ({ value, args }, validator) => {
        const {email: UserMail} = await userClass.getUser(validator.inputs['_id'])
        if(value != UserMail) {
            return await userClass.emailIsAvailable(value); // True ou false
        } else {
            return true
        }
    })

    app.post("/register", async (req, res) => {
        const data = req.body;

        const v = new Validator(data, {
            nom: 'required|string',
            prenom: 'required|string',
            email: 'required|email|checkEmail',
            pass: 'required|string'
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(422).json({ errors: v.errors });
        }

        data.pass = await bcrypt.hash(data.pass, 10);
        data.admin = false;
        const reponse = await userClass.createUser(data);
        const user = reponse.ops[0]
        delete user.pass;
        const token = jwt.sign(user, process.env.secretKey, {
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
            return res.status(422).json({ errors: v.errors });
        }
        passport.authenticate('local', { session: false }, (err, user) => {
            if (err || !user) {
                return res.status(422).json({ globalErrors: [{ message: 'Adresse e-mail ou mot de passe incorrect' }] })
            }

            req.login(user, { session: false }, (err) => {
                if (err) {
                    res.status(422).json({ globalErrors: [{ message: 'Adresse e-mail ou mot de passe incorrect' }] })
                }
                delete user.pass;
                const { _id } = user
                const data = { _id: _id }
                const token = jwt.sign(data, process.env.secretKey, {
                    expiresIn: 432000
                });
                user.token = token
                return res.status(200).json(user)
            })
        })(req, res)
    })

    app.post('/api/user/update', async (req, res) => {

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
            return res.status(422).json(v.errors);
        }
        data.pass ? data.pass = await bcrypt.hash(data.pass, 10) : null;
        data.admin = data.admin === "true";
        const { lastErrorObject, value } = await userClass.updateUser(data);
        if (lastErrorObject.n != 1) {
            return res.status(422).json({ type: "error", message: "Aucun utilisateur n'a été trouvé" })
        } else {
            return res.status(200).json(value);
        }

    })

    app.get('/api/user', (req, res) => {
        return res.status(200).json(req.user)
    })

    app.get('/api/users', async (req, res) => {
        const data = req.query
        const rules = {
            page: 'required|integer',
            limit: 'required|integer'
        }
        try {
            await Validation(data, rules)
            const users = await userClass.getAllUers();
            const {infos, elements} = Paginate(users, data.limit, data.page)
            return res.status(200).json({...infos, allUsers: elements});
        } catch(e) {
            return res.status(422).json({ errors: v.errors });
        }
    })

    app.delete('/api/user/:_id', async (req, res) => {
        const data = req.params
        const v = new Validator(data, {
            _id: 'required|checkObjectid',
        })

        const matched = await v.check();

        if (!matched) {
            return res.status(422).json({ errors: v.errors });
        }
        const { _id } = data
        const user = await userClass.deleteUser(_id)
        return res.status(200).json({ type: 'success' })
    })

    app.put('/api/user', async (req, res) => {
        const data = req.body
        const rules = {
            _id: 'required|checkObjectid',
            nom: 'required|string',
            prenom: 'required|string',
            email: 'required|email|checkUpdateEmail:nom',
            pass: 'string',
            admin: 'boolean'
        }
        try {
            await Validation(data, rules)
           if((data._id != req.user._id) && (req.user.admin == false)) {
               return res.status(422).json({ globalErrors: [{ message: "Vous n'avez pas la permission d'effectuer cette action" }] })
           }
            data.admin && (data.admin = data.admin === 'true')
            data.pass && (data.pass = await bcrypt.hash(data.pass, 10));
            const user = await userClass.updateUser(data);
            delete user.pass
            return res.status(200).json(user);
        } catch (e) {
            return res.status(422).json({errors: e})
        }

    })
}

module.exports = users;