const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
console.log ("ciao");
console.log(pgClient);
// pgClient.on('error', () => console.log('Lost PG connection'));

// pgClient
//   .query('CREATE TABLE IF NOT EXISTS values (number INT)')
//   .catch(err => console.log(err));

// to fix problem of empty index, replace the above (commented) to the following rows (using k8s).
// Then, change the version of the Node pg client library in the server/package.json to any version higher than v8.0 
// (there seemed to be an issue with the v7 version used in the course).
// After these changes, you will need to re-build your server image and push to the DockerHub (do in '/server' path):

//  - docker build -t USERNAME/multi-server .

//  - docker push USERNAME/multi-server
// Then, run kubectl delete -f k8s/ and kubectl apply -f k8s/

pgClient.on('connect', () => {
  pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.log(err));
});

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  console.log("/values/all abc");
  const values = await pgClient.query('SELECT * from values');
  console.log("/values/all await pgClient.query ok");
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  console.log("/values prova");
  const index = req.body.index;
  console.log("/values after index");
  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  console.log("/values after parseInt");
  redisClient.hset('values', index, 'Nothing yet!');
  console.log("/values Redis ok");
  redisPublisher.publish('insert', index);
  console.log("/values Redis publish ok");
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
  console.log("Query ok "+pgClient);
  res.send({ working: true });
});

app.listen(5000, err => {
  console.log('Listening');
});
