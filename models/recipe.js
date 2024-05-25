"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for recipes. */

class Recipe {
  /**
   * Create a recipe (from data), update db, return new recipe data.
   *
   * Data should be { recipe_id, label, image, ingredients, url }
   *
   * Returns { label, image, ingredients, url }
   *
   * Throws BadRequestError if recipe already in database.
   *
   * @param {Object} data - The recipe data.
   * @param {string} data.recipe_id - The ID of the recipe.
   * @param {string} data.label - The label of the recipe.
   * @param {string} data.image - The image URL of the recipe.
   * @param {string[]} data.ingredients - The list of ingredients.
   * @param {string} data.url - The URL of the recipe.
   * @returns {Object} The newly created recipe.
   * @throws {BadRequestError} If the recipe already exists in the database.
   */
  static async createRecipe({ recipe_id, label, image, ingredients, url }) {
    const sanitize = (str) => str.replace(/"/g, '\\"');
    const fieldsToSanitize = { recipe_id, label, image, url };
    const sanitizedFields = {};

    Object.keys(fieldsToSanitize).forEach((key) => {
      sanitizedFields[key] = sanitize(fieldsToSanitize[key]);
    });

    const sanitizedIngredients = JSON.stringify(ingredients).replace(/"/g, '\\"');

    const duplicateCheck = await db.query(
          `SELECT recipe_id
           FROM recipes
           WHERE recipe_id = $1`,
        [recipe_id]);

    if (duplicateCheck.rows[0]){
      return [sanitizedFields.label, sanitizedFields.image, sanitizedIngredients, sanitizedFields.url];
    }
      

    const result = await db.query(
          `INSERT INTO recipes
           (recipe_id, label, image, ingredients, url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING label, image, ingredients, url`,
        [
          sanitizedFields.recipe_id,
          sanitizedFields.label,
          sanitizedFields.image,
          ingredients,
          sanitizedFields.url
        ],
    );
    const recipe = result.rows[0];

    return recipe;
  }

  /**
   * Given a recipe_id, return data about recipe.
   *
   * Returns { label, image, ingredients, url }
   *
   * Throws NotFoundError if not found.
   *
   * @param {string} recipe_id - The ID of the recipe.
   * @returns {Object} The recipe data.
   * @throws {NotFoundError} If the recipe is not found.
   */
  static async getRecipe(recipe_id) {
    const recipeRes = await db.query(
          `SELECT label,
                  image,
                  ingredients,
                  url
           FROM recipes
           WHERE recipe_id = $1`,
        [recipe_id]);

    const recipe = recipeRes.rows[0];

    if (!recipe) throw new NotFoundError(`No recipe: ${recipe_id}`);

    return recipe;
  }
}


module.exports = Recipe;
