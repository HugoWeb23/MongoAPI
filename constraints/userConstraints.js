const userConstraints = async (db) => {
    const collectionName = "utilisateurs";
    const existingCollections = await db.listCollections().toArray();
    if (existingCollections.some(c => c.name === collectionName)) {
        return;
    }

    await db.createCollection(collectionName, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["nom", "prenom", "pass", "admin"],
                properties: {
                    nom: {
                        bsonType: ["string"],
                        description: "Nom de l'utilisateur",
                    },
                    prenom: {
                        bsonType: ["string"],
                        description: "Prénom de l'utilisateur",
                    },
                    pass: {
                        bsonType: ["string"],
                        description: "Mot de passe de l'utilisateur",
                    },
                    admin: {
                        bsonType: ["bool"],
                        description: "L'utilisateur est-il administrateur ?",
                    }
                },
            },
        },
    });
};

module.exports = userConstraints;