"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();


/**
 * GET /:user_id
 *
 * Returns the user data for the specified user ID.
 *
 * @name GET /:user_id
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {number} req.params.user_id - The ID of the user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} An object containing the user data.
 * @throws {BadRequestError} If the user ID is invalid.
 * @throws {NotFoundError} If the user is not found.
 */
router.get("/:user_id", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.user_id);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/**
 * PATCH /:user_id
 *
 * Updates the user data for the specified user ID.
 * Data can include: { firstName, lastName, password }
 *
 * @name PATCH /:user_id
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {number} req.params.user_id - The ID of the user.
 * @param {Object} req.body - The request body.
 * @param {string} [req.body.firstName] - The first name of the user.
 * @param {string} [req.body.lastName] - The last name of the user.
 * @param {string} [req.body.password] - The password of the user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} An object containing the updated user data.
 * @throws {BadRequestError} If the request body is invalid.
 * @throws {NotFoundError} If the user is not found.
 */
router.patch("/:user_id", ensureCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.user_id, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/**
 * DELETE /:user_id
 *
 * Deletes the user with the specified user ID.
 *
 * @name DELETE /:user_id
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {number} req.params.user_id - The ID of the user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} An object confirming the deletion with the user ID.
 * @throws {BadRequestError} If the user ID is invalid.
 * @throws {NotFoundError} If the user is not found.
 */
router.delete("/:user_id", ensureCorrectUser, async function (req, res, next) {
  try {
    await User.remove(req.params.user_id);
    return res.json({ deleted: req.params.user_id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
