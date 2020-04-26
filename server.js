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
    response.status(200).render('public/form/index.html');
});


app.get('/person', (request, response) => {
    let data = {
        name: request.query.name,
        pets: ['dogs', 'cats', 'lizards', 'giraffe'],
    }
    response.status(200).render('pages/index.ejs', {person: data});
});

app.get('pages/searches/new.ejs', (request, response) => {
    response.status(200).render('pages/searches/new.ejs');
})

app.post('/search', (request, response) => {
    //google apis
    let url = 'https://books.google.com/ebooks?id=buc0AAAAMAAJ&dq=holmes&as_brr=4&source=webstore_bookcard'
    let queryObject = {
        q: `${request.body.searchby}:${request.body.search}`
    }
    response.status(200).render('/searches/new')
    
});

superagent.get(url)
    .query(queryObject)
    .then(results => {
        let books = results.body.items.map(book => new Book(book));
        response.status(200).render('searches/show.ejs',{books:books})
    })

    function Book(data){
        this.title = data.volumeInfo.title;
        this.amount = data.saleInfo.listPrice ? data.saleInfo.listPrice.amount: 'Unknown';
    }



app.use('*', (request, response) => {
    console.log(request);
    response.status(404).send(`Can't find ${request.pathname}`);
});

function startServer() {
app.listen(PORT, () => console.log(`Server up on ${PORT}`));
}

startServer();
