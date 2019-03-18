/**
 * Original Source Code from https://github.com/mikesir87/s19-first-node-image
 * Authors: Vince Di Nardo, Vamsi Manne
 * Created to align with Blabber API: https://cs2304.mikesir87.io/spec/
 */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const blabs = [];
uidCount = 0;

app.get('/blabs/:createdSince', (req, res) => {
    
    let output = [];
    for (let i = 0; i < blabs.length; i++) {
        if (blabs[i].postTime >= req.params.createdSince)
            output.push(blabs[i]);
    }
    res.status(200).send(output);
});

app.post('/blabs', (req, res) => {
    const newBlab = {
        id : JSON.stringify(uidCount),
        postTime: (new Date()).getTime(),
        author: req.body.author,
        message: req.body.message,
    }
    blabs.push(newBlab);
    uidCount++;
    res.status(201).send(`Blab created successfully.`);
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

app.listen(3000, () => {
    console.log('Listening on port 3000');
});