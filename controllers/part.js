const { Db, ObjectID } = require("mongodb");
const Part = require('../classes/Part');
const { addCustomMessages, extend, Validator } = require('node-input-validator');
const Question = require("../classes/Question");
const { response } = require("express");

const part = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error("Invalid Database");
    }

const questionClass = new Question(db);
const partClass = new Part(db);

extend('checkObjectid', ({ value }, validator) => {
    if (ObjectID.isValid(value) === false) {
        return false;
    }
    return true;
})

    /**
     * Créer une nouvelle partie et récupérer les questions en fonction des paramètres fournis
     * 
     * Les éléments de recherches :
     * types: un tableau de types de questions à chercher
     * themes: un tableau de thèmes de question à chercher
     * questions: un tableau contenant les questions à afficher
     * limit: une limite de questions à afficher
     * random: possibilité d'afficher les résultats de façon aléatoire
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
         const part = await partClass.createPart(questionsArray, req.user._id);
         const id_part = part.ops[0]._id
         return res.status(200).json({id_part: id_part, questions: questions});
     })

     // Supprimer une partie

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

     // Récupérer toutes les parties

     app.get('/api/parts', async(req, res) => {
         const parts = await partClass.getUserAllParts(req.user._id);
         return res.status(200).json({totalParts: parts.countParts, allParts: parts.allParts});
     })

     // Récupérer les détails d'une partie

     app.get('/api/part/:_id', async(req, res) => {
        const {limit, page} = req.query;
        const data = req.params;
        limit ? data.limit = limit : null;
        page ? data.page = page : null;
        const v = new Validator(data, {
            _id: 'checkObjectid',
            limit: 'required|integer',
            page: 'required|integer'

        })
        const matched = await v.check();
    
        if (!matched) {
            return res.status(422).json(v.errors);
        }
        let response = await partClass.partResults(data._id)
        const NumberOfPages = Math.ceil(response.totalQuestions / data.limit);
        const IndexMax = data.page * data.limit;
        const IndexMin = IndexMax - data.limit;
        response.totalPages = NumberOfPages
        response.questions = response.questions.slice(IndexMin, IndexMax);
        return res.status(200).json(response)
    })
    }

    module.exports = part;