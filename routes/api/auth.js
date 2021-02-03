const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const normalize = require("normalize-url");
const jwt = require("jsonwebtoken");
const config = require("config");

//@route  GET api/auth
//@desc  Test The auth
//@access public

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.post(
  "/",
  [
    check("email", "Please include a valid email.").isEmail(),
    check("password", "Password is required.").exists(),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //Validate user exists or not
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: { msg: "Invalid Credentails!!" } });
      }

      const isMatched = await bcrypt.compare(password, user.password);
      if (!isMatched) {
        return res
          .status(400)
          .json({ errors: { msg: "Invalid Credentails!!" } });
      }

      //JsonWebtoken return - JWT
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecreTKey"),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(`error : ${err.message}`);
      return res.status(400).send("Server Error");
    }
  }
);

module.exports = router;
