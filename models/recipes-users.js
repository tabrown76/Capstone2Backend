"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

class RecipesUsers {
  /**
   * Associate a recipe with a user.
   *
   * Requires recipe_id and user_id.
   *
   * Throws BadRequestError if the relationship already exists.
   *
   * @param {string} recipe_id - The ID of the recipe.
   * @param {number} user_id - The ID of the user.
   * @returns {Object} The recipe-user relationship.
   * @throws {BadRequestError} If the relationship already exists.
   */
  static async addToUser( recipe_id, user_id ) {
    // Check for existing relationship
    const duplicateCheck = await db.query(
      `SELECT 1 FROM recipes_users
       WHERE recipe_id = $1 AND user_id = $2`,
      [recipe_id, user_id]
    );

    if (duplicateCheck.rows[0]) {
      return duplicateCheck.rows[0];
    }

    // Add relationship
    const result = await db.query(
      `INSERT INTO recipes_users (recipe_id, user_id)
       VALUES ($1, $2)
       RETURNING recipe_id, user_id`,
      [recipe_id, user_id]
    );

    return result.rows[0];
  }

  /**
   * Remove association of a recipe to a user; returns undefined.
   *
   * Requires recipe_id and user_id.
   *
   * Throws NotFoundError if recipe-user relationship not found.
   *
   * @param {number} user_id - The ID of the user.
   * @param {string} recipe_id - The ID of the recipe.
   * @returns {undefined}
   * @throws {NotFoundError} If the recipe-user relationship is not found.
   */
  static async removeFromUser( user_id, recipe_id ) {
    const result = await db.query(
      `DELETE FROM recipes_users
       WHERE recipe_id = $1 AND user_id = $2
       RETURNING recipe_id`,
      [recipe_id, user_id]
    );

    const relationship = result.rows[0];

    if (!relationship) {
      throw new NotFoundError(`No recipe-user relationship: ${recipe_id} for user ${user_id}`);
    }
  }

  /**
   * Retrieves recipe info for recipes associated with user_id.
   *
   * Requires user_id.
   *
   * @param {number} user_id - The ID of the user.
   * @returns {Object[]} An array of recipes associated with the user.
   */
  static async findAll(user_id) {
    const result = await db.query(
          `SELECT r.recipe_id, r.label, r.image, r.ingredients, r.url
           FROM recipes_users ru
           JOIN recipes r ON ru.recipe_id = r.recipe_id
           WHERE ru.user_id = $1
           ORDER BY r.recipe_id`,
          [user_id]
    );
  
    return result.rows.map(row => ({
      id: row.recipe_id,
      label: row.label,
      image: row.image,
      ingredients: row.ingredients,
      url: row.url
    }));
  }  
}

module.exports = RecipesUsers;
