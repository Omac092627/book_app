DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  authors VARCHAR(100),
  descriptions VARCHAR(8000),
  isbn VARCHAR(25),
  image_url VARCHAR(200),
);