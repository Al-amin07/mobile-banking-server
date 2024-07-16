require('dotenv').config()
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion } = require('mongodb');
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))
app.use(express.json());

app.get('/', async (req, res) => {
  res.send('Welcome')
})

const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Forbidden Access' })
  }
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'Forbidden Access' })
  }
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Forbidden Access' })
    }
    req.user = decoded;
    console.log('in', req.user)
    next()
  })

}




const uri = process.env.URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const usersCollection = await client.db("mobile").collection("users");

    // Role

    app.get('/role/:email',verifyToken, async(req, res) => {
      const query = { email : req.params.email}
      const result = await usersCollection.findOne(query)
      res.send(result.role)
    })

    // users Register and Login

    app.post('/users', async (req, res) => {
      const user = req.body
      const { pin, ...allUser } = user
      const isExist = await usersCollection.findOne({ email: user.email })
      if (isExist) return res.send('User Exist')
      // const result = await usersCollection.insertOne(user)
      // res.send({result, user})

      bcrypt.hash(pin, 10, async function (err, hash) {

        const newUser = {
          ...allUser,
          pin: hash

        }
        console.log(newUser)
        const result = await usersCollection.insertOne(newUser)
        return res.send(result)

      });
    })

    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      const query = { $or: [{ email: email }, { phone: email }] }
      const isExist = await usersCollection.findOne(query)
      // console.log(isExist)
      if (isExist) {
        bcrypt.compare(password, isExist.pin, function (err, result) {
          // result == true
          // console.log(result)
          if (!result) return res.send({ message: 'Pin Incorrect' })
          const token = jwt.sign(isExist, process.env.SECRET, { expiresIn: '1d' })
          res
            .status(200)
            .send({ user: isExist, token: token })
        });
      }
      else {
        return res.send({ message: 'User Dont Exist!!!' })
      }
    })


    app.get('/users', async(req, res) => {
      const query = {role: 'user'}
      const result = await usersCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/user', async (req, res) => {
      console.log(req.headers.authorization)
     
      const token = req.headers.authorization.split(' ')[1];

      jwt.verify(token, process.env.SECRET, async(err, decoded) => {
      
        req.user = decoded;
        let data;
       if(!decoded) return res.send(null)
       console.log(req.user.email)
      const query = { email: req.user.email}
      const result = await usersCollection.findOne(query);
      return res.send(result)


      })
    })

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