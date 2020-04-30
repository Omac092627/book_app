  
DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(100),
  isbn VARCHAR(13),
  price NUMERIC(10, 7)
)