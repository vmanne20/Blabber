/**
 * Original Source Code from https://github.com/mikesir87/s19-first-node-image
 * Authors: Vince Di Nardo, Vamsi Manne
 * Created to align with Blabber API: https://cs2304.mikesir87.io/spec/
 */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// specify mongo client and URL
const MongoClient = require('mongodb').MongoClient; 
const mongoUrl = 'mongodb://mongo:27017/data/db';
let mongoDb = null;

app.use(bodyParser.json());

uidCount = 0;

app.get('/blabs', (req, res) => {

    const createdSince = req.query.createdSince;
    mongoDb.collection('blabs')
        .find({postTime: {$gte:createdSince}}).toArray()  // finds all blabs that were created after 'createdSince' value
        .then(function(items) {
            res.status(200).send(items);
        });
});

app.post('/blabs', (req, res) => {
    const newBlab = {
        id : JSON.stringify(uidCount),
        postTime: (new Date()).getTime(),
        author: req.body.author,
        message: req.body.message,
    }

    mongoDb.collection('blabs')
        .insertOne(newBlab)         // inserts new blab into Mongo collection
        .then(function(response) {
            uidCount++;
            res.status(201).send(`Blab created successfully.`);
        });
});

app.delete('/blabs/:id', (req, res) => {

    mongoDb.collection('blabs')
        .deleteOne({id: {$eq: req.params.id}})      // delete blab that matches id in request parameter
        .then(function(response) {
            res.status(200).send(`Blab deleted successfully.`);
        });
    res.status(404).send(`Blab not found`);
});

// connects to a MongoDB instance via a URL
MongoClient.connect(mongoUrl, function(err, client) {
    if (err)
        throw err;
    console.log("Connected successfully to server");
    mongoDb = client.db();
    app.listen(80, () => {
        console.log('Listening on port 80');
    });
});