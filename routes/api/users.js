const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const normalize = require("normalize-url");
const jwt = require("jsonwebtoken");
const config = require("config");

//@route  POST api/users
//@desc  Register The user
//@access public

router.post(
  "/",
  [
    check("name", "Please enter Name").notEmpty(),

    check("email", "Please enter valid email").isEmail(),

    check("password", "Password length should be more than 6").isLength({
      min: 6,
      max: 20,
    }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //Validate user exists or not
    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: { msg: "User Already Exists" } });
      }

      let avatar = normalize(
        gravatar.url(email, {
          s: "200",
          r: "pg",
          d: "mm",
        }),
        { forceHttps: true }
      );

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

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

    res.send("User Registered");
  }
);

module.exports = router;
