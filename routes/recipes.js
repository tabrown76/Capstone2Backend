"use strict";

/** Routes for shopping lists. */

const jsonschema = require("jsonschema");
const express = require("express");
const axios = require("axios");
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Recipe = require("../models/recipe");
const RecipesUsers = require("../models/recipes-users");
const router = express.Router();

/**
 * GET /check-url
 * 
 * Checks the accessibility of a URL provided as a query parameter.
 * 
 * @name GET /check-url
 * @function
 * @memberof module:routes/shoppingLists
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters.
 * @param {string} req.query.url - The URL to check.
 * @param {Object} res - The response object.
 * @returns {Object} An object with the status of the check and any relevant HTTP status code.
 * @throws {BadRequestError} If the URL parameter is not provided.
 */
router.get('/check-url', async (req, res) => {
  const url = req.query.url;
  if (!url) {
      throw new BadRequestError('URL parameter is required.');
  }
  try {
      await axios.head(url);
      res.sendStatus(200);
  } catch (error) {
    console.error(`Error checking URL: ${error.message}`);
    res.status(500).send({ status: 'URL is not working', error: error.message });
  }
})

/**
 * GET /:user_id
 * 
 * Returns all recipes associated with the given user ID.
 * 
 * @name GET /:user_id
 * @function
 * @memberof module:routes/shoppingLists
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {number} req.params.user_id - The ID of the user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} An object containing an array of recipes.
 * @throws {BadRequestError} If the user ID is invalid.
 */
router.get("/:user_id", ensureCorrectUser, async function (req, res, next) {
  try {
    const userId = parseInt(req.params.user_id);

    // Validate user ID is a number
    if (isNaN(userId)) {
      throw new BadRequestError("Invalid user ID.");
    }

    // Retrieve recipes using the user_id
    const recipes = await RecipesUsers.findAll(req.params.user_id);

    // Return the list as a JSON array
    return res.json({ recipes });
  } catch (err) {
    return next(err);
  }
})

/**
 * GET /:user_id/:recipe_id
 * 
 * Returns the recipe data specified by the recipe ID.
 * 
 * @name GET /:user_id/:recipe_id
 * @function
 * @memberof module:routes/shoppingLists
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {number} req.params.user_id - The ID of the user.
 * @param {string} req.params.recipe_id - The ID of the recipe.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} An object containing the recipe data.
 * @throws {BadRequestError} If the user ID is invalid.
 */
router.get("/:user_id/:recipe_id", ensureCorrectUser, async function (req, res, next) {
  try {
    const userId = parseInt(req.params.user_id);

    // Validate user ID is a number
    if (isNaN(userId)) {
      throw new BadRequestError("Invalid user ID.");
    }

    // Retrieve the recipe using the recipe_id
    const recipe = await Recipe.getRecipe(req.params.recipe_id);

    // Return the list as a JSON array
    return res.json({ recipe });
  } catch (err) {
    return next(err);
  }
})

/**
 * POST /:user_id/:recipe_id
 * 
 * Adds the recipe to recipes_users.
 * 
 * @name POST /:user_id/:recipe_id
 * @function
 * @memberof module:routes/shoppingLists
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {number} req.params.user_id - The ID of the user.
 * @param {string} req.params.recipe_id - The ID of the recipe.
 * @param {Object} req.body - The request body containing recipe data.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} An object containing the added recipe data.
 * @throws {BadRequestError} If the user ID is invalid.
 */
router.post("/:user_id/:recipe_id", ensureCorrectUser, async function (req, res, next) {
  try {
    const userId = parseInt(req.params.user_id);

    // Validate user ID is a number
    if (isNaN(userId)) {
      throw new BadRequestError("Invalid user ID.");
    }

    const createRecipePromise = Recipe.createRecipe(req.body);
    const addToUserPromise = RecipesUsers.addToUser(req.params.recipe_id, userId);
    const [recipe, relationship] = await Promise.all([createRecipePromise, addToUserPromise]);

    return res.json({ recipe });
  } catch (err) {
    return next(err);
  }
})

/**
 * DELETE /:user_id/:recipe_id
 * 
 * Removes the recipe from recipes_users.
 * 
 * @name DELETE /:user_id/:recipe_id
 * @function
 * @memberof module:routes/shoppingLists
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {number} req.params.user_id - The ID of the user.
 * @param {string} req.params.recipe_id - The ID of the recipe.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} An object confirming the deletion with the recipe ID.
 * @throws {BadRequestError} If the user ID is invalid.
 */
router.delete("/:user_id/:recipe_id", ensureCorrectUser, async function (req, res, next) {
  try {
    const userId = parseInt(req.params.user_id);

    // Validate user ID is a number
    if (isNaN(userId)) {
      throw new BadRequestError("Invalid user ID.");
    }

    await RecipesUsers.removeFromUser(userId, req.params.recipe_id);
    return res.json({ deleted: req.params.recipe_id });
  } catch (err) {
    return next(err);
  }
})

module.exports = router;