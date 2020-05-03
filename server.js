'use strict';

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const pg = require('pg');
const methodOverride = require('method-override');
const app = express();
const methodOverride = require('method-override');

const client = new pg.Client(process.env.DATABASE_URL);

//brings in EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.use(express.static('./public'));
app.use(methodOverride('_method'));


//If it finds the route
app.get ('/', handleIndexPage);
app.get('/new', searchBooks);
app.post('/searches', resultsFromAPI);
app.post('/add', addNewBook);
app.get('/onebook/:id', handleOneBook);
app.delete('/delete-book/:id', handleDelete);
app.put('/update-book/:id', handleUpdate);


//update the book//
function handleUpdate(request, response){
  let SQL = 'UPDATE books set title = $1, authors= $2, descriptions= $3, isbn = $4, image_url= $5 WHERE id = $6';
  let VALUES = [
    request.body.title, 
    request.body.author, 
    request.body.description, 
    request.body.isbn, 
    request.body.image, 
    request.params.id,
  ];
  
  client.query(SQL, VALUES)
    .then(results => {
      response.status(200).redirect(`/onebook/${request.params.id}`)
    })


}


//delete the book//
function handleDelete( request, response) {

  // let id = request.body.id; // 4
  // app.post('/delete/:id') ... the :id is request.params.id

  let id = request.params.id; // 77

  let SQL = 'DELETE FROM books WHERE id = $1';
  let VALUES = [id];

  client.query( SQL, VALUES )
    .then( (resposne) => {
      response.status(200).redirect('/');
    });


}




function addNewBook (request, response) {
  // console.log('Book to be added: ', request.body);
  let SQL = `
    INSERT INTO books (title, authors, descriptions, isbn, image_url)
    VALUES($1, $2, $3, $4, $5)
  `;

let VALUES = [
  request.body.title,
  request.body.author,
  request.body.description,
  request.body.isbn,
  request.body.image,
];

if ( ! (request.body.title || request.body.authors || request.body.descriptions || request.body.isbn || request.body.image_url) ) {
  throw new Error('invalid input');
}

client.query(SQL, VALUES)
  .then( results => {
    response.status(200).redirect('/');
  })
  .catch( error => {
    console.error( error.message );
  });
}

function searchBooks(request, response) {
  response.status(200).render('pages/searches/new')
};


function handleOneBook( request, response) {
  const SQL = `SELECT * FROM books WHERE id = $1`;
  const VALUES = [request.params.id];
  client.query(SQL, VALUES)
    .then( results => {
      response.status(200).render('pages/onebook', {book:results.rows[0]});
    })
    .catch(error => {
      console.error(error.message);
    });
  
}

function resultsFromAPI (request, response) {
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
};

function Book(data) {
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors;
  this.image = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : `https://i.imgur.com/J5LVHEL.jpg`;
  this.description = data.volumeInfo.description || 'no description available';
  this.amount = data.saleInfo.listPrice ? `$${data.saleInfo.listPrice.amount}` : 'no price available';
  this.isbn = data.volumeInfo.industryIdentifiers ? data.volumeInfo.industryIdentifiers[0].identifier : 'no isbn available';
}

function handleIndexPage (request, response)  {

  const SQL =  `SELECT * FROM books`;
  
  client.query(SQL)
    .then( results => {
      response.status(200).render('pages/index', {books:results.rows});
    })
}

function deleteBook(request, response) {
  let id = request.params.id;

  let SQL = "DELETE FROM books WHERE id = $1";
  let VALUES = [id];

  client.query(SQL, VALUES)
    .then( (results => {
      response.status(200).redirect('/')
    }));
}

function updateBook(request, response) {
  let id = request.params.id;

  let SQL = 'UPDATE books SET authors = "Chuck Li" WHERE id = $1';
  let VALUES = [id];

  client.query(SQL, VALUES)
    .then( (results => {
      response.status(200).redirect('/')
    }));
}

// This will force an error
app.get('/badthing', (request,response) => {
  throw new Error('bad request???');
});

// 404 Handler
app.use('*', (request, response) => {
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