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
const mongoUrl = 'mongodb://mongo:27017';
let mongoDb = null;

app.use(bodyParser.json());

uidCount = 0;

app.get('/blabs', (req, res) => {

    mongoDb.collection('blabs')
        .find({}).toArray()
        .then(function(items) {
            const createdSince = req.query.createdSince;
            let blabs = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].postTime >= createdSince)
                    blabs.push(items[i]);
            }
            res.status(200).send(blabs);
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
        .insertOne(newBlab)
        .then(function(response) {
            uidCount++;
            res.status(201).send(`Blab created successfully.`);
        });
});

app.delete('/blabs/:id', (req, res) => {

    for (let i = 0; i < blabs.length; i++) {
        if (blabs[i].id === req.params.id) {
            blabs.splice(i, 1);
            res.status(200).send(`Blab deleted successfully.`);
            return;
        }
    }
    res.status(404).send(`Blab not found`);
});

MongoClient.connect(mongoUrl, function(err, client) {
    if (err)
        throw err;

    console.log("Connected successfully to server");
   
    mongoDb = client.db();

    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
});