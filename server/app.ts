var express = require('express');
var cors = require('cors');
var compression = require('compression');
import * as path from 'path';
import * as http from 'http';
import { MongoClient } from 'mongodb';
import { Request, Response } from 'express';

const app = express();
const server = http.createServer(app);
const router = express.Router();

const uri = "mongodb+srv://devadmin:devadmin@learningcluster-ijumw.mongodb.net/admin";
const client = new MongoClient(uri, { useNewUrlParser: true });

// Apply the routes to our application with the prefix /api
// Options for cors midddleware
// const options: cors.CorsOptions = {
//   methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
//   origin: '*',
//   preflightContinue: true,
//   optionsSuccessStatus: 200
// };

// Use cors middleware
router.use(cors({
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: '*',
  preflightContinue: true,
  optionsSuccessStatus: 200
}));
router.options('*', cors({
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: '*',
  preflightContinue: true,
  optionsSuccessStatus: 200
}));

const port = process.env.PORT || 8080;
app.set('port', port);

app.use('/', express.static(path.join(__dirname, '../client')));
app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: '*',
  preflightContinue: true,
  optionsSuccessStatus: 200
}));
app.use('/api', router);

app.get('*', (request: Request, response: Response) => {
  response.sendFile(path.join(__dirname, '../client/index.html'));
});

server.listen(app.get('port'), () => {
  console.log(`Server started on port ${server.address().port} :)`);
});

router.get('/', (request: Request, response: Response) => {
  response.send('api works');
});

router.get('/players', (request: Request, response: Response) => {
  client.connect(error => {
    if (error) throw error;
    // perform actions on the collection object
    client.db("scfl").collection('players').find().toArray(function (err, result) {
      if (err) throw err;
      response.send(result);
      //  client.close();
    });
  });
});

router.post("/addPlayers", (request: Request, response: Response) => {
  // save the payments in store and check for errors
  client.connect(error => {
    if (error) throw error;
    // perform actions on the collection object
    console.log('add players');
    client.db("scfl").collection('players').insertMany(request.body)
      .then(function (result) {
        response.send(result);
      })
  });
});

router.post("/addTeam", (request: Request, response: Response) => {
  // save the payments in store and check for errors
  client.connect(error => {
    if (error) throw error;
    // perform actions on the collection object
    console.log('add team');
    client.db("scfl").collection('teams').insertOne(request.body)
      .then(function (result) {
        response.send(result);
      })
  });
});

router.post("/addTeams", (request: Request, response: Response) => {
  // save the payments in store and check for errors
  client.connect(error => {
    if (error) throw error;
    // perform actions on the collection object
    console.log('add teams');
    client.db("scfl").collection('teams').insertMany(request.body)
      .then(function (result) {
        response.send(result);
      })
  });
});

router.get('/getTeams', (request: Request, response: Response) => {
  client.connect(error => {
    if (error) throw error;
    // perform actions on the collection object
    console.log('get teams');
    client.db("scfl").collection('teams').find().toArray(function (err, result) {
      if (err) throw err;
      response.send(result);
      //  client.close();
    });
  });
});

router.get("/resetTeams", (request: Request, response: Response) => {
  // save the payments in store and check for errors
  client.connect(error => {
    if (error) throw error;
    // perform actions on the collection object
    console.log('delete teams');
    client.db("scfl").collection('teams').deleteMany()
      .then(function (result) {
        response.send(result);
      })
  });
});

router.get("/resetPlayers", (request: Request, response: Response) => {
  // save the payments in store and check for errors
  client.connect(error => {
    if (error) throw error;
    // perform actions on the collection object
    console.log('delete players');
    client.db("scfl").collection('players').deleteMany()
      .then(function (result) {
        response.send(result);
      })
  });
});

export { app };
