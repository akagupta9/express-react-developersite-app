const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

//@route  GET api/profile/me
//@desc  get current users profile
//@access private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for the user" });
    }
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server Error", error: "Error :" + err });
  }
});

//@route  POST api/profile
//@desc  create or update the pofile
//@access private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").notEmpty(),
      check("skills", "skills is required").notEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const {
        company,
        website,
        location,
        status,
        skills,
        bio,
        githubusername,
        youtube,
        linkdln,
        twitter,
        facebook,
        instagram,
      } = req.body;

      const profileFields = {};
      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (status) profileFields.status = status;
      if (bio) profileFields.bio = bio;
      if (githubusername) profileFields.githubusername = githubusername;

      if (skills) {
        profileFields.skills = skills.split(",").map((skill) => skill.trim());
      }
      console.log(profileFields.user);

      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (linkdln) profileFields.social.linkdln = linkdln;
      if (twitter) profileFields.social.twitter = twitter;
      if (facebook) profileFields.social.facebook = facebook;
      if (instagram) profileFields.social.instagram = instagram;

      try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
          console.log("Updating the profile----");
          profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          );

          return res.json(profile);
        }

        profile = new Profile(profileFields);
        await profile.save();
        return res.json(profile);
      } catch (err) {
        console.error(err);
        res.status(500).send("Server Errror");
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Server Error", error: "Error :" + err });
    }
  }
);

//@route  GET api/profile/
//@desc  get all users profile
//@access private

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server Error", error: "Error :" + err });
  }
});

//@route  GET api/profile/user/:user_id
//@desc  get user profile by user id
//@access public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "Profile doesn't exist" });
    }
    res.json(profile);
  } catch (err) {
    console.log(err);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile doesn't exist" });
    }
    res.status(500).json({ msg: "Server Error", error: "Error :" + err });
  }
});

//@route  DELETE api/profile/
//@desc  delete profile,user or post
//@access private

router.delete("/", auth, async (req, res) => {
  try {
    //Delete profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //Delete User
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User Deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server Error", error: "Error :" + err });
  }
});

//@route  PUT api/profile/experience
//@desc   add experirnce in profile
//@access private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").notEmpty(),
      check("company", "Company is required").notEmpty(),
    ],
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array(), msg: "Error" });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    let experience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(req.body);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server Error", error: "Error :" + err });
    }
  }
);

module.exports = router;
