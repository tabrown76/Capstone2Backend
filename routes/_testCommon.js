"use strict";

const db = require("../db.js");
const Recipe = require("../models/recipe.js");
const RecipesUsers = require("../models/recipes-users.js");
const ShoppingList = require("../models/shopping-list.js");
const User = require("../models/user.js");
const { createToken } = require("../helpers/tokens.js");

const recipeIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM shopping_list");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM recipes_users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM recipes");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");  
  // restart serialized id
  await db.query("ALTER SEQUENCE users_user_id_seq RESTART WITH 1");
  
  await User.register({
    username: "u1",
    password: "password1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com"
  });
  await User.googleRegister({
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    googleId: "123abc"
  });
  await User.register({
    username: "u3",
    password: "password3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com"
  });

  recipeIds[0] = (await Recipe.createRecipe(
      { recipe_id: "123abc", label: "r1", image: "www.i1.com", ingredients: ["i1", "i2"], url: "www.test1.com"}));
  recipeIds[1] = (await Recipe.createRecipe(
      { recipe_id: "456def", label: "r2", image: "www.i2.com", ingredients: ["i3", "i4"], url: "www.test2.com"}));

  await RecipesUsers.addToUser(recipeIds[0].recipe_id, "1");

  await ShoppingList.addRecipeIngredients("1", ["i1", "i2", "i3"]);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ firstName: "U1F", user_id: 1 });
const u2Token = createToken({ firstName: "U2F", user_id: 2 });


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  recipeIds,
  u1Token,
  u2Token
};
