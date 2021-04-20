const { ObjectID } = require('mongodb');

const defaultQuestions = [{
    type: 1,
    intitule: "Traduis cette phrase",
    themeId: new ObjectID("607883a01013ff0924aa67ba"),
    question: "Le chien entre dans la maison",
    reponse: "the dog enters the house"
},
{
    type: 2,
    intitule: "Cette phrase est-celle correcte ?",
    themeId: new ObjectID("607883a01013ff0924aa67ba"),
    question: "Exemple de phrase",
    propositions: [{
        proposition: "Oui",
        correcte: false,
        _id: new ObjectID()
    }, {
        proposition: "Non",
        correcte: true,
        _id: new ObjectID()
    }]
}]

module.exports = defaultQuestions;