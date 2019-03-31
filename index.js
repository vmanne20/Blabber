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
    const createdSince = req.query.createdSince;
    mongoDb.collection('blabs')
        // {'postTime': {$gte: createdSince}} 
        .find( {'postTime': {$gt: createdSince}} ).toArray()             // finds all blabs that were created after 'createdSince' value
        .then(function(items) {
            res.status(200).send(items);
        });
});

app.post('/blabs', (req, res) => {
    const newBlab = {
        // JSON.stringify(uidCount)
        id : JSON.stringify(uidCount),
        postTime: ((new Date()).getTime() / 1000.0),
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
        .remove( {'id': {$eq: req.params.id}})     // delete blab that matches id in request parameter
        .then(function(response) {
            console.log("Response: " + response);
            console.log("length: " + response.length);
            if (response.length == 0)
                res.status(404).send(`Blab not found`);
            else
                res.status(200).send(`Blab deleted successfully.`);   
        });
       //.catch(err => res.status(404).send(`Blab not found`));
    // catch (err) {
    //     res.status(404).send(`Blab not found`);
    // }
    //.catch();
    // (err) => {
    //     if (err)
    //         res.status(404).send(`Blab not found`);
    // }
});

// connects to a MongoDB instance via a URL
MongoClient.connect(mongoUrl, function(err, client) {
    if (err)
        throw err;
    console.log("Connected successfully to server");
    mongoDb = client.db();
    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
});