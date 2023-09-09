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





// const express = require('express');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const app = express();
// const router = require('./routeManager');

// dotenv.config();

// app.get('/', (req, res) => {
//     res.send('Welcome');
// });

// async function startServer() {
//     try {
//         app.app = app; 
//         router();
        
//         await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
        
//         app.listen(5000, () => {
//             console.log('Server is listening on port 5000');
//         });
        
//         console.log('Connected to the database');
//     } catch (error) {
//         console.error('An error occurred:', error);
//     }
// }

// startServer();
