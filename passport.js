const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const dotenv = require('dotenv');
const { Db, ObjectID } = require("mongodb");

const myPassportLocal = (db) => {
    const userCollection = db.collection('utilisateurs');
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pass'
    }, async (email, pass, cb) => {
        try {
            const user = await userCollection.findOne({ email })
            if (user && await bcrypt.compare(pass, user.pass)) {
                return cb(null, user)
            } else {
                return cb(null, false)
            }
        } catch (e) {

        }
    }))
}

const myPassportJWT = (db) => {
    passport.use(
        new JWTStrategy({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.secretKey
        }, async (jwtPayLoad, cb) => {
            if (jwtPayLoad) {
                return cb(null, jwtPayLoad);
            } else {
                return cb(null, false);
            }
        }
        )
    )
}

module.exports = { myPassportLocal, myPassportJWT };