DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  authors VARCHAR(100),
  TEXTIMAGE_ON image,
  description VARCHAR(500),
  isbn VARCHAR(13),
  listPrice VARCHAR(20),
)