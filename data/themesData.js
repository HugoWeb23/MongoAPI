const { ObjectID } = require('mongodb');

const defaultThemes = [{
    _id: new ObjectID("607ef8eb91427f5421f6c757"),
    theme: "Les jours de la semaine FR -> EN"
},
{
    _id: new ObjectID("607ef8f4165fb6c891978a18"),
    theme: "Les pronoms personnels sujets EN -> FR"
},
{
    _id: new ObjectID("607ef9140f4023ea51df19f2"),
    theme: "Les nombres"
},
{
    _id: new ObjectID("607ef9484ac4034cdf8c3361"),
    theme: "La nature EN -> FR"
}]

module.exports = defaultThemes;