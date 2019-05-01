/**
 * Original Source Code from https://github.com/mikesir87/s19-first-node-image
 * Authors: Vince Di Nardo, Vamsi Manne
 * Created to align with Blabber API: https://cs2304.mikesir87.io/spec/
 */

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient; 
const PromClient = require('prom-client');

// This is a gauge in case later we want it to be a current "count"
const NumBlabsGauge = new PromClient.Gauge({ name: 'total_blabs_created_count', help: 'The number of blabs created ever from this app instance (not the number of existing blabs).' });
NumBlabsGauge.set(0);
const ReqTimeHistogram = new PromClient.Histogram({
    name: 'http_request_durations_sec',
    help: 'Request durations for all endpoints accessed, as a histogram.',
    // buckets: [0.1, 5, 15, 50, 100, 500]
});
// console.log("HELP:" + ReqTimeHistogram.observe(10));

// console.log(String(process.env.BLABBER_DB_CONNECTION));

let mongoUrl = '';//mongodb://user:super-secret-password@mongo:27017';
mongoUrl = fs.readFileSync(/*'/run/secrets/mongo-connection'*/ process.env.BLABBER_DB_CONNECTION, 'utf-8').trim();
// mongoUrl = 'mongodb://mongo:27017';// TODO: REMOVE THIS!!!
console.log(mongoUrl);

// specify mongo client and port
// const mongoUrl = 'mongodb://' + user + ':' + password + '@mongo:27017';
// const mongoUrl = 'mongodb://user:super-secret-password@mongo:27017';
// console.log(mongoUrl);
let mongoDb = null;

app.use(bodyParser.json());

// let opt = {
//     auth: {
//         user: 'user',
//         password: 'password',
//         authdb: 'admin'
//     }
// };

// ---------- PROMETHEUS GET REQUEST ------------

const collectDefaultMetrics = PromClient.collectDefaultMetrics;

// Probe every 5th second.
collectDefaultMetrics({ prefix: 'blabber_api_', timeout: 5000 });

app.get('/metrics', (req, res) => {
    const end = ReqTimeHistogram.startTimer();
    res.status(200).send(PromClient.register.metrics());
    end();
});

// ------------ GET REQUEST ---------------------
app.get('/blabs', (req, res) => {
    const end = ReqTimeHistogram.startTimer(); // Note: the healthcheck checks here, so it will constantly increast the count

    const createdSince = req.query.createdSince;

    // if createdSince is specified as query with GET request
    if (createdSince) {
        // finds all blabs that were created after 'createdSince' value
        mongoDb.collection('blabs')
            .find( {'postTime': {$gte: parseFloat(createdSince)}} ).toArray()  
            .then(items => {
                res.status(200).send(items);
            });
    } else {
        // finds all blabs created recently if 'createdSince' is not specified
        mongoDb.collection('blabs')
            .find( {'postTime': {$gte: ((new Date()).getTime() / 1000) - 5}} ).toArray()  
            .then(items => {
                res.status(200).send(items);
            });
    }

    end();
});


// ------------ POST REQUEST ---------------------
app.post('/blabs', (req, res) => {
    const end = ReqTimeHistogram.startTimer();

    const currentTime = ((new Date()).getTime() / 1000);
    const newBlab = {
        id: currentTime,
        postTime: currentTime,
        author: req.body.author,
        message: req.body.message,
    }

    // inserts new blab into Mongo collection
    mongoDb.collection('blabs')
        .insertOne(newBlab)         
        .then(response => {
            res.status(201).send(newBlab);
            NumBlabsGauge.inc();
        });
    
    end();
});


// ------------ DELETE REQUEST ---------------------
app.delete('/blabs/:id', (req, res) => {
    const end = ReqTimeHistogram.startTimer();

    // finds blab that matches ID in request parameter
    try {
        mongoDb.collection('blabs')
            .find( {'id': {$exists: true, $eq: parseFloat(req.params.id)}}).toArray()
            .then(items => {

                // if matching blab was found, remove it and send success status
                if (items.length > 0) {
                    mongoDb.collection('blabs').deleteOne({id: parseFloat(req.params.id)}, err => {
                        res.status(200).send(`Blab deleted successfully.`); 
                    });
                } else {
                    res.status(404).send(`Blab not found`);
                }
            });
    } // if blab with requested ID does not exist, catch 404 error
    catch (err) {
        res.status(404).send(`Blab not found`);
        end();
    }

    end();
});


// connects to a MongoDB instance via port 27017
MongoClient.connect(mongoUrl, (err, client) => {
    if (err) {
        console.log("Failed to connect to mongo server");
        throw err;
    }
    console.log("Connected successfully to mongo server");
    mongoDb = client.db();
    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
});

// // Retries connecting until connects to mongo
// async function tryConnecting(callback) {
//     MongoClient.connect(mongoUrl, opt, (err, client) => {
//         if (err) {
//             console.log("Failed to connect to mongo server");
//             setTimeout(() => tryConnecting(callback), 1000);
//             throw err;
//         } else {
//             callback();
//             mongoDb = client.db('test').admin();
//             // mongoDb.auth(opt.user, opt.pass);
//             app.listen(3000, () => {
//                 console.log('Listening on port 3000');
//             });
//         }
//     });
// }

// tryConnecting(() => {
//     console.log("Connected successfully to mongo server");
// });