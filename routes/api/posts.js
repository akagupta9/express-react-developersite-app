const express = require("express");
const router = express.Router();

//@route  GET api/posts
//@desc  Test The posts
//@access public

router.get("/", (req, res) => {
  res.send("Post Route");
});

module.exports = router;
