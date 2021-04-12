const testConstraints = async (db) => {
  const collectionName = "test";
  const existingCollections = await db.listCollections().toArray();
  if (existingCollections.some(c => c.name === collectionName)) {
    return;
  }

  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["firstName", "lastName", "birthday", "active"],
        properties: {
          firstName: {
            bsonType: ["string"],
            description: "must be a string and is required",
          },
          lastName: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          birthday: {
            bsonType: "date",
            description: "must be a date and is required",
          },
          active: {
            bsonType: "bool",
            description: "must be a bool and is required",
          },
          addresses: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["street", "number", "city", "zipCode"],
              properties: {
                street: {
                  bsonType: "string",
                  description: "must be a string and is required",
                },
                number: {
                  bsonType: "string",
                  description: "must be a string and is required",
                },
                city: {
                  bsonType: "string",
                  description: "must be a string and is required",
                },
                zipCode: {
                  bsonType: "string",
                  description: "must be a string and is required",
                },
              }
            }
          }
        },
      },
    },
  });
};

module.exports = testConstraints;
