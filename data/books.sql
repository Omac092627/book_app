DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  authors VARCHAR(100),
  descriptions VARCHAR(1000),
  isbn VARCHAR(13),
  listPrice VARCHAR(20)
);