const { Db, ObjectID } = require("mongodb");
const Part = require('../classes/Part');
const { addCustomMessages, extend, Validator } = require('node-input-validator');
const Question = require("../classes/Question");

const part = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error("Invalid Database");
    }

const questionClass = new Question(db);
const partClass = new Part(db);

// Créer une nouvelle partie et récupérer les questions en fonction des paramètres fournis
    /**
     * Les éléments de recherches :
     * types: un tableau de types de questions à chercher
     * themes: un tableau de thèmes de question à chercher
     */

     app.post('/api/part/new', async (req, res) => {
        const data = req.body;
        const v = new Validator(data, {
         types: 'array', // Tableau de types a chercher
         'types.*': 'integer',
         themes: 'array', // Tableau de thèmes a chercher
         'themes.*': 'checkObjectid',
         questions: 'array',
         'questions.*': 'checkObjectid',
         limit: 'integer', // Limite de questions à afficher
         random: 'boolean'
     })
     const matched = await v.check();
 
     if (!matched) {
         return res.status(422).json(v.errors);
     }
     data.types ? data.types = data.types.map(i => parseInt(i, 10)) : null;
     data.themes ? data.themes = data.themes.map(t => new ObjectID(t)) : null;
     data.questions ? data.questions = data.questions.map(q => new ObjectID(q)) : null;
     data.limit ? data.limit = parseInt(data.limit, 10) : data.limit = parseInt(30, 10); // 30 questions par défaut
    
         const questions = await questionClass.getQuestions(data);
       
         const questionsArray = []
            questions.map(q => {
            const question = {
                questionId: q._id
            }
            questionsArray.push(question)
        })
         const part = await partClass.createPart(questionsArray);
         const id_part = part.ops[0]._id
         return res.status(200).json({id_part: id_part, questions: questions});
     })

     app.delete('/api/part/:_id', async(req, res) => {
         const data = req.params;
         const v = new Validator(data, {
          _id: 'required|checkObjectid',
      })
      const matched = await v.check();
  
      if (!matched) {
          return res.status(422).json(v.errors);
      }
      const part = await partClass.deletePart(data._id);
      if(part.result.n != 1) {
          return res.status(422).json({type: 'error', message: "La partie n'existe pas"})
      }
      return res.status(200).json({type: 'success', message: "La partie a été supprimée"})
     })
    }

    module.exports = part;