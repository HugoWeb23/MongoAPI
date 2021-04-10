import { default as mongodb } from 'mongodb';
const Db = mongodb.Db;
const ObjectID = mongodb.ObjectID;
import { User } from '../classes/User.js';

export const users = (app, db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }
  const userCollection = db.collection("users");
  const UserClass = new User(db);

  app.post("/users", async (req, res) => {
    const data = req.body;
    try {
      data.active = data.active === 'true';
      data.birthday = new Date(data.birthday);
      const { street, number, city, zipCode } = req.body;
      data.addresses = [{
        street,
        number,
        city,
        zipCode,
        _id: new ObjectID()
      }]
      console.log(data)
      const response = await db.collection("users").insertOne(data);

      if (response.result.n !== 1 && response.result.ok !== 1) {
        return res.status(400).json({ error: "impossible to create the user" });
      }
      const user = response.ops[0];

      res.json(user);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: "impossible to create the user" });
    }

  });

  // lister tous les utilisateurs
  app.get("/users", async (req, res) => {
    const users = await userCollection.find().toArray();
    res.json(users);
  });

  // lister un utilisateeur
  app.get("/users/:userId", async (req, res) => {
    const { userId } = req.params;
    const _id = new ObjectID(userId);
    const user = await userCollection.findOne({ _id });
    if (user == null) {
      return res.status(404).send({ error: "Impossible to find this user" });
    }
    res.json(user);
  });

  // Mettre à jour un utilisateur
  app.post("/users/:userId", async (req, res) => {
    const { userId } = req.params;
    const data = req.body;
    data.birthday = new Date(data.birthday)
    data.active = data.active === 'true'
    const _id = new ObjectID(userId);
    const response = await userCollection.findOneAndUpdate(
      {
        _id,
        'addresses._id': new ObjectID("60717172ee6d803110c3afb6")
      },
      {
        $set: {
          firstName: data.firstName,
          lastName: data.lastName,
          active: data.active,
          'addresses.$.street': data.street,
          'addresses.$.number': data.number,
          'addresses.$.city': data.city,
          'addresses.$.zipCode': data.zipCode
        }
      },
      {
        returnOriginal: false,
      }
    );

    if (response.ok !== 1 && response.result.n != 1) {
      return res.status(400).json({ error: "Impossible to update the user" });
    }
    res.json(response.value);
  });

  // Supprimer un utilisateur
  app.delete("/users/:userId", async (req, res) => {
    const { userId } = req.params;
    const _id = new ObjectID(userId);
    const response = await userCollection.findOneAndDelete({ _id });
    if (response.value === null) {
      return res.status(404).send({ error: "impossible to remove this user" });
    }

    res.status(204).send();
  });

  //ajouter une adresse
  app.post("/users/:userId/addresses", async (req, res) => {
    const { userId } = req.params;
    const { street, number, city, zipCode } = req.body;
    const _id = new ObjectID(userId);

    const { value } = await userCollection.findOneAndUpdate(
      {
        _id,
      },
      {
        $push: {
          addresses: {
            street,
            number,
            city,
            zipCode,
            _id: new ObjectID(),
          },
        },
      },
      {
        returnOriginal: false,
      }
    );

    res.json(value);
  });

  // Supprimer une adresse
  app.delete("/users/:userId/addresses/:addressId", async (req, res) => {
    const { userId, addressId } = req.params;
    const _id = new ObjectID(userId);
    const _addressId = new ObjectID(addressId);

    const { value } = await userCollection.findOneAndUpdate(
      {
        _id,
      },
      {
        $pull: { addresses: { _id: _addressId } },
      },
      {
        returnOriginal: false,
      }
    );

    res.json(value);
  });


  // Modifier une adresse
  app.post("/users/:userId/addresses/:addressId", async (req, res) => {
    const { userId, addressId } = req.params;
    const { street, number, city } = req.body;
    const _id = new ObjectID(userId);
    const _addressId = new ObjectID(addressId);

    const { value } = await userCollection.findOneAndUpdate(
      {
        _id,
        'addresses._id': _addressId
      },
      {
        $set: {
          'addresses.$.street': street,
          'addresses.$.number': number,
          'addresses.$.city': city,
        },
      },
      {
        returnOriginal: false,
      }
    );

    res.json(value);
  });


  // Récuperation de toutes les adresses
  app.get("/users/:userId/addresses", async (req, res) => {
    const { userId } = req.params;

    const addresses = await userCollection.aggregate([
      { $match: { _id: new ObjectID(userId) } },
      { $unwind: '$addresses' },
      { $project: { addresses: 1, _id: 0 } },
      {
        $addFields: {
          city: '$addresses.city',
          street: '$addresses.street',
          number: '$addresses.number',
          _id: '$addresses._id',
        }
      },
      { $project: { city: 1, street: 1, number: 1 } },
      // { $replaceRoot: { newRoot: '$addresses' }} 
    ]).toArray();

    res.json(addresses);
  });
};
