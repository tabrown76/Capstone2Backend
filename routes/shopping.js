"use strict";

/** Routes for shopping lists. */

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const ShoppingList = require("../models/shopping-list");
const shoppingSchema = require("../schemas/shopping.json");
const router = express.Router();

/**
 * GET /:user_id
 *
 * Returns the shopping list of the user specified by user_id.
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
 * @returns {Object} An object containing the shopping list of the user.
 * @throws {BadRequestError} If the user ID is invalid.
 * @throws {Error} If the shopping list retrieval fails.
 */
router.get("/:user_id", ensureCorrectUser, async function (req, res, next) {
  try {
    const userId = parseInt(req.params.user_id);

    // Validate user ID is a number
    if (isNaN(userId)) {
      throw new BadRequestError("Invalid user ID.");
    }

    // Retrieve the shopping list using the user ID
    const list = await ShoppingList.getUserShoppingList(userId);

    // Ensure the list is an array (important if no ingredients are found)
    if (!Array.isArray(list)) {
      return res.status(500).json({ error: "Failed to retrieve shopping list." });
    }

    // Return the list as a JSON array
    return res.json({ list });
  } catch (err) {
    return next(err);
  }
})

/**
 * POST /:user_id
 *
 * Creates the shopping list of the user specified by user_id with the provided list items.
 * Expected req.body format: { ingredients: ["apple", "banana", "carrot"] }
 *
 * @name POST /:user_id
 * @function
 * @memberof module:routes/shoppingLists
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {number} req.params.user_id - The ID of the user.
 * @param {Object} req.body - The request body.
 * @param {string[]} req.body.ingredients - The list of ingredients.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} An object containing the updated shopping list.
 * @throws {BadRequestError} If the user ID or request body is invalid.
 */
router.post("/:user_id", ensureCorrectUser, async function (req, res, next) {
  try {
    const userId = parseInt(req.params.user_id);

    // Validate user ID is a number
    if (isNaN(userId)) {
      throw new BadRequestError("Invalid user ID.");
    }

    const validator = jsonschema.validate(req.body, shoppingSchema);
    
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const list = await ShoppingList.addRecipeIngredients(userId, req.body.ingredients);
    return res.json({ list });
  } catch (err) {
    return next(err);
  }
})

/**
 * PATCH /:user_id
 *
 * Updates the shopping list of the user specified by user_id with the provided list items.
 * Expected req.body format: { ingredients: ["apple", "banana", "carrot"] }
 *
 * @name PATCH /:user_id
 * @function
 * @memberof module:routes/shoppingLists
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {number} req.params.user_id - The ID of the user.
 * @param {Object} req.body - The request body.
 * @param {string[]} req.body.ingredients - The list of ingredients.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} An object containing the updated shopping list.
 * @throws {BadRequestError} If the user ID or request body is invalid.
 */
router.patch("/:user_id", ensureCorrectUser, async function (req, res, next) {
  try {
    const userId = parseInt(req.params.user_id);

    // Validate user ID is a number
    if (isNaN(userId)) {
      throw new BadRequestError("Invalid user ID.");
    }

    const validator = jsonschema.validate(req.body, shoppingSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const list = await ShoppingList.updateList(userId, req.body.ingredients);
    return res.json({ list });
  } catch (err) {
    return next(err);
  }
})

module.exports = router;