const express = require('express');
const userRoutes = require('./routes/users');
const pokemonRoutes = require('./routes/pokemon');
const battleRoutes = require('./routes/battles');
const app = express();



app.use('/users', userRoutes);
app.use('/pokemon', pokemonRoutes);
app.use('/battles', battleRoutes);

module.exports = app;