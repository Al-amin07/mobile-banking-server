require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
app.use(cors())
app.use(express.json());

app.get('/', async(req, res) => {
    res.send('Welcome')
})




const uri = "mongodb+srv://mobile_booking:<password>@cluster0.pekpvn6.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
  
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);


app.listen(8000, () => {
    console.log('Port Running')
})

// 4eiqfrkByI664Peg
// mobile_booking