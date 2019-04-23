/**
 * Original Source Code from https://github.com/mikesir87/s19-first-node-image
 * Authors: Vince Di Nardo, Vamsi Manne
 * Created to align with Blabber API: https://cs2304.mikesir87.io/spec/
 */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// specify mongo client and port
const MongoClient = require('mongodb').MongoClient; 
const mongoUrl = 'mongodb://mongo:27017';
let mongoDb = null;

app.use(bodyParser.json());

let opt = {
    auth: {
        user: 'user',
        password: 'password',
        authdb: 'admin'
    }
};

// ------------ GET REQUEST ---------------------
app.get('/blabs', (req, res) => {
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
});


// ------------ POST REQUEST ---------------------
app.post('/blabs', (req, res) => {
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
        });
});


// ------------ DELETE REQUEST ---------------------
app.delete('/blabs/:id', (req, res) => {

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
    } 
    // if blab with requested ID does not exist, catch 404 error
    catch (err) {
        res.status(404).send(`Blab not found`);
    }
});


// connects to a MongoDB instance via port 27017
// MongoClient.connect(mongoUrl, (err, client) => {
//     if (err) {
//         console.log("Failed to connect to mongo server");
//         throw err;
//     }
//     console.log("Connected successfully to mongo server");
//     mongoDb = client.db();
//     app.listen(3000, () => {
//         console.log('Listening on port 3000');
//     });
// });

// Retries connecting until connects to mongo
async function tryConnecting(callback) {
    MongoClient.connect(mongoUrl, opt, (err, client) => {
        if (err) {
            console.log("Failed to connect to mongo server");
            setTimeout(tryConnecting.bind(callback), 1000);
            throw err;
        } else {
            callback();
            mongoDb = client.db('test').admin();
            // mongoDb.auth(opt.user, opt.pass);
            app.listen(3000, () => {
                console.log('Listening on port 3000');
            });
        }
    });
}

tryConnecting(() => {
    console.log("Connected successfully to mongo server");
});