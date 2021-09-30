const defaultQuestions = require('../data/questionsData');
const questionConstraints = async (db) => {
    const collectionName = "questions";
    const existingCollections = await db.listCollections().toArray();
    if (existingCollections.some(c => c.name === collectionName)) {
        return;
    }

    await db.createCollection(collectionName, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["type", "intitule", "themeId", "question"],
                properties: {
                    type: {
                        bsonType: "int",
                        description: "Type de question",
                    },
                    intitule: {
                        bsonType: "string",
                        description: "Intitulé de la question",
                    },
                    themeId: {
                        bsonType: "objectId",
                        description: "Thème de la question",
                    },
                    question: {
                        bsonType: "string",
                        description: "La question",
                    },
                    reponses: {
                        bsonType: "array"
                    },
                    propositions: {
                        bsonType: "array",
                        items: {
                            bsonType: "object",
                            required: ["proposition", "correcte"],
                            properties: {
                                proposition: {
                                    bsonType: "string",
                                    description: "La proposition de réponse",
                                },
                                correcte: {
                                    bsonType: "bool",
                                    description: "Cette proposition est-elle celle attendue ?",
                                }
                            }
                        }
                },
            },
        },
    }
    });
    // Insertion des questions par défaut
    //db.collection(collectionName).insertMany(defaultQuestions);
};

module.exports = questionConstraints;
