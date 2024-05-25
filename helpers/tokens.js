const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/**
 * Return signed JWT from user data.
 *
 * @param {Object} user - The user object.
 * @param {string} user.firstName - The first name of the user.
 * @param {number} user.user_id - The ID of the user.
 * @returns {string} The signed JWT.
 */
function createToken(user) {
  let payload = {
    firstName: user.firstName,
    user_id: user.user_id
  };
  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
