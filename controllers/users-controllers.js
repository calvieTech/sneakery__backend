const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const { faker } = require("@faker-js/faker");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find({}, "-password");
	} catch (err) {
		const error = new HttpError("Fetching users failed, please try again later.", 500);
		return next(error);
	}

	res.status(201).json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req.body);
	if (!errors.isEmpty()) {
		return next(new HttpError("Invalid inputs passed, please check your data.", 422));
	}

	let { username, email, password } = req.body;
	let imgPath = `http://localhost:3001/uploads/avatars/${req.file.filename}`;
	let existingUser;

	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError("Signing up failed, Email exists already", 500);
		console.log(error.message);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError("User exists already, please login instead.", 422);
		return next(error);
	}

	let hashedPassword,
		saltRounds = 6;

	try {
		hashedPassword = await bcrypt.hash(password, saltRounds);
	} catch (err) {
		const error = new HttpError("Could not create user (password maybe?), please try again", 500);
		return next(error);
	}

	const createdUser = new User({
		username,
		email,
		hashedSaltedPassword: hashedPassword,
		avatar: imgPath,
		places: [],
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError("Signing up failed, please try again.", 500);
		console.log(`error1: `, error.message);
		return next(error);
	}

	let userToken,
		secret_key = `${procss.env.JSON_PRIVATE_TOKEN}`;
	try {
		userToken = jwt.sign(
			{
				userId: createdUser.id,
				email: createdUser.email,
				username: createdUser.username,
			},
			secret_key,
			{ expiresIn: "6h" }
		);
	} catch (err) {
		const error = new HttpError("Signing up failed, please try again.", 500);
		return next(error);
	}

	res.status(201).json({
		userId: createdUser.id,
		username: createdUser.username,
		email: createdUser.email,
		jwt: userToken,
	});
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	let existingUser;

	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError("Logging in failed, please try again later.", 500);
		return next(error);
	}

	if (!existingUser) {
		const error = new HttpError("Invalid credentials, could not log you in.", 401);
		return next(error);
	}

	let isPasswordValid = false;
	try {
		isPasswordValid = await bcrypt.compare(password, existingUser.hashedSaltedPassword);
	} catch (err) {
		const error = new HttpError("Could not login, please check password", 500);
		return next(error);
	}

	if (!isPasswordValid) {
		const error = new HttpError("Could not login, invalid password", 500);
		return next(error);
	}

	let userToken,
		secret_key = `${procss.env.JSON_PRIVATE_TOKEN}`;
	try {
		userToken = jwt.sign(
			{
				userId: createdUser.id,
				email: createdUser.email,
				username: createdUser.username,
			},
			secret_key,
			{ expiresIn: "6h" }
		);
	} catch (err) {
		const error = new HttpError("Logging in failed, please try again.", 500);
		return next(error);
	}

	res.json({ message: "Logged in!", user: existingUser.toObject({ getters: true }) });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
