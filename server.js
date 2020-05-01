'use strict';

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const pg = require('pg');
const app = express();

const client = new pg.Client(process.env.DATABASE_URL);

//brings in EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));

//If it finds the route
app.get ('/', handleIndexPage);


//new search route
app.get('/new', (request, response) => {
  response.status(200).render('pages/searches/new')
});

// route for saved books//
// app.get('/index: books', handleGetOneBook);
// app.post('/', handleNewBook);

//show route
app.post('/searches', (request, response) => {
  let url = 'https://www.googleapis.com/books/v1/volumes';
  let queryObject = {
    q: `${request.body.searchby}:${request.body.search}`,
  };
  
  superagent.get(url)
  .query(queryObject)
  .then(results => {
    console.log(results);
    let books = results.body.items.map(book => new Book(book));
    response.status(200).render('pages/searches/show', {books: books});
  });
});

function Book(data) {
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors;
  this.image = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : `https://i.imgur.com/J5LVHEL.jpg`;
  this.description = data.volumeInfo.description || 'no description available';
  this.amount = data.saleInfo.listPrice ? `$${data.saleInfo.listPrice.amount}` : 'no price available';
  this.isbn = data.volumeInfo.industryIdentifiers ? data.volumeInfo.industryIdentifiers[0].identifier : 'no isbn available';
}

function handleIndexPage (request, response)  {

  response.status(200).render('pages/index');
}


function handleNewBook(request, response){
  let SQL = `
  INSERT INTO books (title, authors, images, descriptions, isbn, listPrice)
  VALUES($1, $2, $3, $4, $5, $6) 
  `;
  
  let VALUES = [
    request.body.title, 
    request.body.authors, 
    request.body.images,
    request.body.descriptions,
    request.body.isbn, 
    request.body.listPrice
  ];
  
  if ( ! (request.body.title || request.body.authors || request.body.images || request.body.descriptions || request.body.isbn || request.body.listPrice) ) {
    throw new Error('invalid input');
  }
  
  client.query(SQL, VALUES)
  .then(results => {
    response.status(200).redirect('/', {VALUES});
  })
  .catch(error => {
    console.error(error.message);
  });
}

function handleGetOneBook(request, response){
  const SQL =  `SELECT * FROM books WHERE id = $1`;
  const VALUES = [request.params.books];
  
  console.log('getting', request.params.books);
  
  client.query(SQL, VALUES)
  .then(results => {
    response.status(200).render('/books', {books:results.rows[0]});
  })
  .catch(error => {
    console.error(error.message);
  });
}

// This will force an error
app.get('/badthing', (request,response) => {
  throw new Error('bad request???');
});

// 404 Handler
app.use('*', (request, response) => {
  console.log(request);
  response.status(404).send(`Can't Find ${request.path}`);
});

// Error Handler
app.use( (err,request,response,next) => {
  console.error(err);
  response.status(500).render('pages/error', {err})
});

// Startup
function startServer() {
  app.listen( PORT, () => console.log(`Server running on ${PORT}`));
}

//connecting the client to the databse//
client.connect()
  .then( () => {
    startServer(PORT);
  })
  .catch(err => console.error(err));