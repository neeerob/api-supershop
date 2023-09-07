const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const app = express();
const router = require('./routeManager');

app.get('/', (req, res) => {
    res.send('Welcome');
})

async function main() {
    try {
        this.app = app;
        
        router();
    } catch (err) {
        console.log(err);
    }
}

main();


mongoose.set("strictQuery", false);
mongoose.
    connect('mongodb+srv://admin:Nirob112233@nirobapi.xojpsay.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
        router();
        console.log('Connected to database')
        app.listen(5000, () => {
            console.log('listening on 5000');
        });
    }).catch((error) => {
        console.log(error)
    })
