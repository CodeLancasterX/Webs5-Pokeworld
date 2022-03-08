const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/users');
const pokemonRoutes = require('./routes/pokemon');
const battleRoutes = require('./routes/battles');
const battleRequestRoutes = require('./routes/battleRequests');
const encounterRoutes = require('./routes/encounters');
const moveRoutes = require('./routes/moves');
const baseRoute = require('./routes/baseRoute');
const app = express();

connectMongoDB().catch(err => console.log(err));

async function connectMongoDB() {
  await mongoose.connect(process.env.MongoDBConnectionString);
}
 
app.use(morgan('dev'));
//recognise incoming requests as string or body.
app.use(express.urlencoded({extended: false}));
//recognise incoming requests as json.
app.use(express.json());
//handling CORS, second argument in allow orgin specifies who has access to data from api. 
//second argument in allow header specifies which headers are allowed in requests.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', '*');
    
    //empty object because this responds shows the client which methods are allowed in the header.
    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
})

// app.use('/', baseRoute);

app.get('/', (req, res) => {
    const pokeWorldRoutes = {
        routes: [{userRoutes: ['get_all_users: / ', 'get_user_by_id: /:id', 'get_encounter_by_userId: /:userId/encounters' ]}]
    }

    res.status(200).json({
         pokeWorldRoutes
    })
})
app.use('/users', userRoutes);
app.use('/pokemon', pokemonRoutes);
app.use('/battles', battleRoutes);
app.use('/battlerequests', battleRequestRoutes);
app.use('/encounters', encounterRoutes);
app.use('/moves', moveRoutes);

//error handling
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;