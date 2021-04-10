export const themeConstraints = async (db) => {
    const collectionName = "themes";
    const existingCollections = await db.listCollections().toArray();
    if (existingCollections.some(c => c.name === collectionName)) {
        return;
    }

    await db.createCollection(collectionName, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["theme"],
                properties: {
                    theme: {
                        bsonType: ["string"],
                        description: "Nom du thème",
                    }
                },
            },
        },
    });
};
