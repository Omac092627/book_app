'use strict';

const PORT = process.env.PORT || 3000;

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const app = express();

app.use( express.urlencoded({extended:true }));
app.use( express.static('./form') );
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
    response.status(200).send('You\re not as stupid as you thought');
});

app.get('/loveofmylife', (request, response) => {
    response.status(200).send('Message in a bottle')
});

app.post('/bros', (request, response) => {
    response.status(200).send(request.body.article);
});

app.use('*', (request, response) => {
    console.log(request);
    response.status(404).send(`Can't find ${request.pathname}`);
});

function startServer() {
app.listen(PORT, () => console.log(`Server up on ${PORT}`));
}

startServer();
