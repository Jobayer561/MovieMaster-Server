const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.oxmkd9u.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send(`Server is running on port : ${port}`);
});

async function run() {
  try {
    await client.connect();

    const db = client.db("movie-master");
    const movieCollection = db.collection("movies");

    app.get("/movies", async (req, res) => {
      const result = await movieCollection.find().toArray();
      res.send(result);
    });

    app.get("/movies/:id", async (req, res) => {
      const { id } = req.params;
      const result = await movieCollection.findOne({ _id: new ObjectId(id) });
      res.send({ success: true, result });
    });

    app.get("/featuredMovies", async (req, res) => {
      const result = await movieCollection.find().limit(5).toArray();
      res.send(result);
    });

    app.get("/stats", async (req, res) => {
      const totalMovies = await movieCollection.countDocuments();
      res.send({totalMovies});
    });
    app.get("/top-rated", async (req, res) => {
      
        const topMovies = await movieCollection.find().sort({ rating: -1 }).limit(5).toArray();
        res.send(topMovies);
      } 
    );
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
