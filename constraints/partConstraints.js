const partConstraints = async (db) => {
    const collectionName = "parties";
    const existingCollections = await db.listCollections().toArray();
    if (existingCollections.some(c => c.name === collectionName)) {
        return;
    }

    await db.createCollection(collectionName, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["userId", "date"],
                properties: {
                    userId: {
                        bsonType: "objectId",
                        description: "ID de l'utilisateur",
                    },
                    date: {
                        bsonType: "date",
                        description: "Date de la partie",
                    },
                    questions: {
                        bsonType: "array",
                        items: {
                            bsonType: "object",
                            properties: {
                                questionId: {
                                    bsonType: "objectId",
                                    description: "ID de la question",
                                },
                                correcte: {
                                    bsonType: "bool",
                                    description: "La réponse a-t-elle été répondue correctement ?",
                                },
                                reponseEcrite: {
                                    bsonType: "string",
                                    description: "La réponse fournie",
                                }
                            }
                        }
                    }
                },
            },
        },
    });
};

module.exports = partConstraints;