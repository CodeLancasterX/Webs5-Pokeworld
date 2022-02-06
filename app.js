const express = require('express');
const morgan = require('morgan');

const userRoutes = require('./routes/users');
const pokemonRoutes = require('./routes/pokemon');
const battleRoutes = require('./routes/battles');
const app = express();

app.use(morgan('dev'));
//makes it possible for the body to be accessed.
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use('/users', userRoutes);
app.use('/pokemon', pokemonRoutes);
app.use('/battles', battleRoutes);

//Error handling
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