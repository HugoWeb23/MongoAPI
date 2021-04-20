const { ObjectID } = require('mongodb');

const defaultQuestions = [{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef8eb91427f5421f6c757"),
    question: "lundi",
    reponse: "monday"
},
{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef8eb91427f5421f6c757"),
    question: "mardi",
    reponse: "tuesday"
},
{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef8eb91427f5421f6c757"),
    question: "mercredi",
    reponse: "wednesday"
},
{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef8eb91427f5421f6c757"),
    question: "jeudi",
    reponse: "thursday"
},
{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef8eb91427f5421f6c757"),
    question: "vendredi",
    reponse: "friday"
},
{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef8eb91427f5421f6c757"),
    question: "samedi",
    reponse: "saturday"
},
{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef8eb91427f5421f6c757"),
    question: "dimanche",
    reponse: "sunday"
},
{
    type: 1,
    intitule: "Traduis ce mot en français",
    themeId: new ObjectID("607ef8f4165fb6c891978a18"),
    question: "i",
    reponse: "je"
},
{
    type: 1,
    intitule: "Traduis ce mot en français",
    themeId: new ObjectID("607ef8f4165fb6c891978a18"),
    question: "you",
    reponse: "tu ou vous"
},
{
    type: 2,
    intitule: "Traduis ce mot en français",
    themeId: new ObjectID("607ef8f4165fb6c891978a18"),
    question: "he",
    propositions: [{
        proposition: "elle",
        correcte: false,
        _id: new ObjectID()
    },
    {
        proposition: "il",
        correcte: true,
        _id: new ObjectID()
    },
    {
        proposition: "nous",
        correcte: false,
        _id: new ObjectID()
    },
    {
        proposition: "vous",
        correcte: false,
        _id: new ObjectID()
    }]
},
{
    type: 2,
    intitule: "Traduis ce mot en français",
    themeId: new ObjectID("607ef8f4165fb6c891978a18"),
    question: "it",
    propositions: [{
        proposition: "je",
        correcte: false,
        _id: new ObjectID()
    },
    {
        proposition: "il",
        correcte: true,
        _id: new ObjectID()
    },
    {
        proposition: "ils",
        correcte: false,
        _id: new ObjectID()
    },
    {
        proposition: "tu",
        correcte: false,
        _id: new ObjectID()
    }]
},
{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef9484ac4034cdf8c3361"),
    question: "arbre",
    reponse: "tree"
},
{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef9484ac4034cdf8c3361"),
    question: "mer",
    reponse: "sea"
},
{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef9484ac4034cdf8c3361"),
    question: "navire",
    reponse: "ship"
},
{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef9484ac4034cdf8c3361"),
    question: "eau",
    reponse: "water"
},
{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef9484ac4034cdf8c3361"),
    question: "rivière",
    reponse: "river"
},
{
    type: 1,
    intitule: "Traduis ce mot en anglais",
    themeId: new ObjectID("607ef9484ac4034cdf8c3361"),
    question: "terre",
    propositions: [{
        proposition: "island",
        correcte: false,
        _id: new ObjectID()
    },
    {
        proposition: "land",
        correcte: true,
        _id: new ObjectID()
    }]
}]

module.exports = defaultQuestions;