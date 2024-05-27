-- Table for users
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(25) UNIQUE,
  password TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  google_id TEXT UNIQUE
);


-- Table for recipes
CREATE TABLE recipes (
  recipe_id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  image TEXT,
  ingredients TEXT[] NOT NULL,
  url TEXT
);

-- Junction table for many-to-many relationship between users and recipes
CREATE TABLE recipes_users (
  user_id INTEGER,
  recipe_id TEXT,
  CONSTRAINT fk_user
    FOREIGN KEY(user_id) 
    REFERENCES users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_recipe
    FOREIGN KEY(recipe_id) 
    REFERENCES recipes(recipe_id)
    ON DELETE CASCADE
);

-- Table for shopping lists
CREATE TABLE shopping_list (
  list_id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE,
  ingredients TEXT[],
  CONSTRAINT fk_user_shopping_list
    FOREIGN KEY(user_id) 
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
