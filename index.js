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
    const usersCollection = db.collection("users");

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        res.send({
          message: "user already exits. do not need to insert again",
        });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    app.get("/movies", async (req, res) => {
      const result = await movieCollection.find().toArray();
      res.send(result);
    });
    app.post("/movies", async (req, res) => {
      const data = req.body;
      const result = await movieCollection.insertOne(data);
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
      const totalUsers = await usersCollection.countDocuments();
      res.send({ totalMovies, totalUsers });
    });
    app.get("/top-rated", async (req, res) => {
      const topMovies = await movieCollection
        .find()
        .sort({ rating: -1 })
        .limit(5)
        .toArray();
      res.send(topMovies);
    });

    app.get("/latestMovies", async (req, res) => {
      const latestMovies = await movieCollection
        .find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();
      res.send(latestMovies);
    });

    app.get('/myCollection',async(req,res)=>{
      const email = req.query.email;
        console.log("Fetching movies for:", email);

      const movies = await movieCollection.find({addedBy : email}).toArray();
      console.log('after finding email',movies);
      res.send(movies)
    })
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
