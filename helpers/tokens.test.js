const jwt = require("jsonwebtoken");
const { createToken } = require("./tokens");
const { SECRET_KEY } = require("../config");

describe("createToken", function () {
    test("works", function () {
    const token = createToken({ firstName: "fN", user_id: "0" });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      firstName: "fN",
      user_id: "0"
    });
  });
});
