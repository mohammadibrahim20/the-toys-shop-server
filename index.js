const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tjdcdj5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db("toysManagement").collection("toys");

    /*     const indexKeys = { productName: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "titleCategory" }; // Replace index_name with the desired index name
    const result = await toysCollection.createIndex(indexKeys, indexOptions); */

    // console.log(result);

    app.post("/addToys", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await toysCollection.insertOne(data);
      res.send(result);
    });
    app.get("/allToys", async (req, res) => {
      const limit = parseInt(req.query.limit);
      const result = await toysCollection.find().limit(limit).toArray();
      res.send(result);
    });
    app.get("/myToys", async (req, res) => {
      const email = req.query.email;
      const sorting = req.query.sort;

      if (sorting === "all") {
        const query = { sellerEmail: email };
        const result = await toysCollection.find(query).toArray();
        res.send(result);
      }
      if (sorting === "low") {
        const query = { sellerEmail: email };
        const result = await toysCollection
          .find(query)
          .sort({ price: 1 })
          .toArray();
        res.send(result);
      }
      if (sorting === "high") {
        const query = { sellerEmail: email };
        const result = await toysCollection
          .find(query)
          .sort({ price: -1 })
          .toArray();
        res.send(result);
      }
    });

    /*   app.get("/myToys", async (req, res) => {
      const email = req.query.email;
      const query = { sellerEmail: email };
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    }); */

    app.get("/category", async (req, res) => {
      const category = req.query.category;
      const query = { subcategory: category };
      const result = await toysCollection.find(query).limit(3).toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/search/:text", async (req, res) => {
      let text = req.params.text;
      const result = await toysCollection
        .find({
          $or: [{ productName: { $regex: text, $options: "i" } }],
        })
        .toArray();

      res.send(result);
    });

    app.put("/updates/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const doc = req.body;
      const updateDoc = {
        $set: {
          ...doc,
        },
      };
      const result = await toysCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to toy Server!");
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
