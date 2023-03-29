const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");
const { fileUploadAvatars } = require("../middleware/file-upload");

const router = express.Router();

router.get("/", usersController.getUsers);

router.post(
	"/signup",
	fileUploadAvatars.single("avatar"),
	[
		check("name").not().isEmpty(),
		check("email").normalizeEmail().isEmail(),
		check("password").isLength({ min: 6 }),
	],
	usersController.signup
);

router.post("/login", usersController.login);

module.exports = router;
