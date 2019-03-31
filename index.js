/**
 * Original Source Code from https://github.com/mikesir87/s19-first-node-image
 * Authors: Vince Di Nardo, Vamsi Manne
 * Created to align with Blabber API: https://cs2304.mikesir87.io/spec/
 */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// specify mongo client and port to connect to
const MongoClient = require('mongodb').MongoClient; 
const mongoUrl = 'mongodb://mongo:27017';
let mongoDb = null;

app.use(bodyParser.json());
uidCount = 0;   // global count that is assigned to new blabs as a unique ID


// ------------ GET REQUEST ---------------------
app.get('/blabs', (req, res) => {
    const createdSince = req.query.createdSince;

    // finds all blabs that were created after 'createdSince' value
    mongoDb.collection('blabs')
        .find( {'postTime': {$gte: createdSince}} ).toArray()  
        .then(function(items) {
            res.status(200).send(items);
        });
});


// ------------ POST REQUEST ---------------------
app.post('/blabs', (req, res) => {
    const newBlab = {
        id : JSON.stringify(uidCount),
        postTime: ((new Date()).getTime() / 1000.0),
        author: req.body.author,
        message: req.body.message,
    }

    mongoDb.collection('blabs')
        .insertOne(newBlab)         // inserts new blab into Mongo collection
        .then(function(response) {
            uidCount++;
            res.status(201).send(`Blab ${newBlab.id} created successfully.`);
        });
});


// ------------ DELETE REQUEST ---------------------
app.delete('/blabs/:id', (req, res) => {

    // finds blab that matches id in request parameter
    mongoDb.collection('blabs')
        .find( {'id': {$exists: true, $eq: req.params.id}}).toArray()
        .then(function(items, err) {

            // if matching blab was found, remove it and send success status
            if (items.length > 0) {
                mongoDb.collection('blabs').remove({id: req.params.id}, err => {
                    res.status(200).send(`Blab deleted successfully.`); 
                });
            } 
            
            // if matching blab was NOT found, send 404 status
            else {    
                res.status(404).send(`Blab not found`);
                throw err;
            }
        });
});


// connects to a MongoDB instance via port 27017
MongoClient.connect(mongoUrl, function(err, client) {
    if (err)
        throw err;
    console.log("Connected successfully to server");
    mongoDb = client.db();
    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
});