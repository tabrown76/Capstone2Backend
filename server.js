"use strict";

const app = require("./app");
const { PORT } = require("./config");

/**
 * Start the Express application and listen on the specified port.
 * Logs the server start message to the console.
 */
app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
