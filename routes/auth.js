"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const userGoogleSchema = require("../schemas/userGoogle.json");
const { BadRequestError } = require("../expressError");

/**
 * POST /auth/token
 * 
 * Generates a JWT token for the user to authenticate further requests.
 * 
 * @name POST /auth/token
 * @function
 * @memberof module:routes/auth
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} [req.body.username] - The username of the user.
 * @param {string} [req.body.password] - The password of the user.
 * @param {string} [req.body.googleId] - The Google ID of the user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} An object containing the JWT token.
 * @throws {BadRequestError} If the request body is invalid.
 */
router.post("/token", async function (req, res, next) {
  try {
    const { username, password, googleId } = req.body;

    // Validate the request body based on the presence of googleId
    const validator = googleId ?
      jsonschema.validate(req.body, userGoogleSchema) :
      jsonschema.validate(req.body, userAuthSchema);

    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    let user;
    if (googleId) {
      user = await User.authenticateWithGoogle(googleId);
    } else {
      user = await User.authenticate(username, password);
    }

    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
})

/**
 * POST /auth/register
 * 
 * Registers a new user and generates a JWT token for the user to authenticate further requests.
 * 
 * @name POST /auth/register
 * @function
 * @memberof module:routes/auth
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.username - The username of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {string} req.body.firstName - The first name of the user.
 * @param {string} req.body.lastName - The last name of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} An object containing the JWT token.
 * @throws {BadRequestError} If the request body is invalid.
 */
router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /auth/googleregister
 * 
 * Registers a new user using Google account information and generates a JWT token for the user to authenticate further requests.
 * 
 * @name POST /auth/googleregister
 * @function
 * @memberof module:routes/auth
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.firstName - The first name of the user.
 * @param {string} req.body.lastName - The last name of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.googleId - The Google ID of the user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} An object containing the JWT token.
 * @throws {BadRequestError} If the request body is invalid.
 */
router.post("/googleregister", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userGoogleSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.googleRegister({ ...req.body });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
