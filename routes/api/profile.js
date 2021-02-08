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
      console.log(profileFields.skills);

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
          profile = await Profile.findByIdAndUpdate(
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

module.exports = router;
