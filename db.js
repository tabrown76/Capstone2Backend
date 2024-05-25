"use strict";
/** Database setup for neweats. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  /**
   * Creates a new PostgreSQL client with SSL configuration for production.
   * @type {Client}
   */
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  /**
   * Creates a new PostgreSQL client without SSL configuration for non-production environments.
   * @type {Client}
   */
  db = new Client({
    connectionString: getDatabaseUri()
  });
  
}
db.connect();

module.exports = db;