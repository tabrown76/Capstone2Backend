"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /**
   * Authenticate user with username and password.
   *
   * Returns { user_id, username, first_name, last_name, email }
   *
   * Throws UnauthorizedError if user not found or wrong password.
   *
   * @param {string} username - The username of the user.
   * @param {string} password - The password of the user.
   * @returns {Object} The authenticated user.
   * @throws {UnauthorizedError} If the user is not found or the password is incorrect.
   */
  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT user_id,
                  username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /**
   * Authenticate user with Google ID.
   *
   * Returns { user_id, username, firstName, lastName, email }
   *
   * Throws UnauthorizedError if user not found.
   *
   * @param {string} googleId - The Google ID of the user.
   * @returns {Object} The authenticated user.
   * @throws {UnauthorizedError} If the user is not found.
   */
  static async authenticateWithGoogle(googleId) {
    // Try to find the user by Google ID
    const result = await db.query(
          `SELECT user_id,
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM users
           WHERE google_id = $1`,
        [googleId],
    );

    const user = result.rows[0];

    if (user) {
      return user;
    }

    throw new UnauthorizedError("Invalid Google ID");
  }


  /**
   * Register user with data.
   *
   * Returns { user_id, username, firstName, lastName, email }
   *
   * Throws BadRequestError on duplicates.
   *
   * @param {Object} data - The user data.
   * @param {string} data.username - The username of the user.
   * @param {string} data.password - The password of the user.
   * @param {string} data.firstName - The first name of the user.
   * @param {string} data.lastName - The last name of the user.
   * @param {string} data.email - The email of the user.
   * @returns {Object} The registered user.
   * @throws {BadRequestError} If the username is a duplicate.
   */
  static async register(
      { username, password, firstName, lastName, email }) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING user_id, username, first_name AS "firstName", last_name AS "lastName", email`,
        [
          username,
          hashedPassword,
          firstName,
          lastName,
          email
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /**
   * Register user with Google data.
   *
   * Returns { user_id, firstName, lastName, email, googleId }
   *
   * Throws BadRequestError on duplicates.
   *
   * @param {Object} data - The user data.
   * @param {string} data.firstName - The first name of the user.
   * @param {string} data.lastName - The last name of the user.
   * @param {string} data.email - The email of the user.
   * @param {string} data.googleId - The Google ID of the user.
   * @returns {Object} The registered user.
   * @throws {BadRequestError} If the Google ID is a duplicate.
   */
  static async googleRegister(
      { firstName, lastName, email, googleId }) {
    const duplicateCheck = await db.query(
          `SELECT google_id
           FROM users
           WHERE google_id = $1`,
        [googleId],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate registration: ${googleId}`);
    }

    const result = await db.query(
          `INSERT INTO users
           (first_name,
            last_name,
            email,
            google_id)
           VALUES ($1, $2, $3, $4)
           RETURNING user_id, first_name AS "firstName", last_name AS "lastName", email, google_id AS "googleId"`,
        [
          firstName,
          lastName,
          email,
          googleId
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /**
   * Find all users.
   *
   * Returns [{ user_id, first_name, last_name, email }, ...]
   *
   * @returns {Object[]} An array of all users.
   */
  static async findAll() {
    const result = await db.query(
          `SELECT user_id,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM users
           ORDER BY user_id`,
    );

    return result.rows;
  }

  /**
   * Given a user_id, return data about user.
   *
   * Returns { user_id, first_name, last_name, email }
   *
   * Throws NotFoundError if user not found.
   *
   * @param {number} user_id - The ID of the user.
   * @returns {Object} The user data.
   * @throws {NotFoundError} If the user is not found.
   */
  static async get(user_id) {
    const userRes = await db.query(
          `SELECT user_id,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM users
           WHERE user_id = $1`,
        [user_id],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${user_id}`);

    return user;
  }

  /**
   * Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email }
   *
   * Returns { user_id, firstName, lastName, email }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risk is opened.
   *
   * @param {number} user_id - The ID of the user.
   * @param {Object} data - The data to update.
   * @param {string} [data.firstName] - The first name of the user.
   * @param {string} [data.lastName] - The last name of the user.
   * @param {string} [data.password] - The password of the user.
   * @param {string} [data.email] - The email of the user.
   * @returns {Object} The updated user data.
   * @throws {NotFoundError} If the user is not found.
   */
  static async update(user_id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name"
        });
    const useridVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE user_id = ${useridVarIdx} 
                      RETURNING user_id,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email`;
    const result = await db.query(querySql, [...values, user_id]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${user_id}`);

    delete user.password;
    return user;
  }

  /**
   * Delete given user from database; returns undefined.
   *
   * @param {number} user_id - The ID of the user.
   * @returns {void}
   * @throws {NotFoundError} If the user is not found.
   */
  static async remove(user_id) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE user_id = $1
           RETURNING user_id`,
        [user_id],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${user_id}`);
  }
}

module.exports = User;
