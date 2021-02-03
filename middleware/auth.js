const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.json({ msg: "No Token. Authentication Denied" });
  }

  try {
    const decode = jwt.verify(token, config.get("jwtSecreTKey"));
    req.user = decode.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
