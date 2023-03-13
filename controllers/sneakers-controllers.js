const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
// const getCoordsForAddress = require("../util/location");
const Sneaker = require("../models/sneaker");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

const getSneakerById = async (req, res, next) => {
	const sneakerId = req.params.pid; // { pid: 'p1' }

	let sneaker;
	try {
		sneaker = await Sneaker.findById(sneakerId).exec();
	} catch (err) {
		const error = new HttpError("Something went wrong, could not find a sneaker.", 500);
		return next(error);
	}

	if (!sneaker) {
		const error = new HttpError("Could not find a sneaker for the provided id.", 404);
		return next(error);
	}

	res.json({ sneaker: sneaker.toObject({ getters: true }) }); // => { sneaker } => { sneaker: sneaker }
};

// function getSneakerById() { ... }
// const getSneakerById = function() { ... }

const getSneakersByUserId = async (req, res, next) => {
	const userId = req.params.uid;

	// let sneakers;
	let userWithSneakers;
	try {
		// sneakers = await Sneaker.find({ creator: userId }).exec();
		userWithSneakers = await User.findById(userId).populate("sneakers");
	} catch (err) {
		const error = new HttpError("Fetching sneakers failed, please try again later", 500);
		return next(error);
	}

	if (!userWithSneakers || userWithSneakers.length === 0) {
		return next(new HttpError("Could not find sneakers for the provided user id.", 404));
	}

	res.json({
		sneakers: userWithSneakers.sneakers.map((sneaker) => sneaker.toObject({ getters: true })),
	});
};

const createSneaker = async (req, res, next) => {
	const errors = validationResult(req.body);
	if (!errors.isEmpty()) {
		return next(new HttpError("Invalid inputs passed, please check your data.", 422));
	}

	const { title, description, creator } = req.body;

	// let coordinates;
	// try {
	// 	coordinates = await getCoordsForAddress(address);
	// } catch (error) {
	// 	return next(error);
	// }

	const createdSneaker = new Sneaker({
		title,
		description,
		image:
			"https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg",
		creator,
	});

	let user;

	try {
		user = await User.findById(creator).exec();
	} catch (err) {
		const error = new HttpError("Creating sneaker failed, please try again", 500);
		return next(error);
	}

	if (!user) {
		const error = new HttpError("Could not find user for provided id", 404);
		return next(error);
	}

	try {
		const currentSession = await mongoose.startSession();
		currentSession.startTransaction();
		await createdSneaker.save({ session: currentSession });
		user.sneakers.push(createdSneaker);
		await user.save({ session: currentSession });
		await currentSession.commitTransaction();
		// await createdSneaker.save().exec();
	} catch (err) {
		const error = new HttpError("Creating sneaker failed, please try again.", 500);
		return next(error);
	}

	res.status(201).json({ sneaker: createdSneaker });
};

const updateSneaker = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError("Invalid inputs passed, please check your data.", 422));
	}

	const { title, description } = req.body;
	const sneakerId = req.params.pid;
	let sneaker;
	try {
		sneaker = await Sneaker.findById(sneakerId).exec();
	} catch (err) {
		const error = new HttpError("Something went wrong, could not find sneaker in MongoDB.", 500);
		return next(error);
	}

	sneaker.title = title;
	sneaker.description = description;

	try {
		await sneaker.save();
	} catch (err) {
		const error = new HttpError(
			"Something went wrong with MongoDB, could not update sneaker in MongoDB.",
			500
		);
		return next(error);
	}

	res.status(200).json({ sneaker: sneaker.toObject({ getters: true }) });
};

const deleteSneaker = async (req, res, next) => {
	const sneakerId = req.params.pid;

	let sneaker;
	try {
		sneaker = await Sneaker.findById(sneakerId).populate("creator").exec();
	} catch (err) {
		const error = new HttpError("Something went wrong, could not delete sneaker.", 500);
		return next(error);
	}

	if (!sneaker) {
		const error = new HttpError("Could not find sneaker for this ID", 404);
		return next(error);
	}

	try {
		// await sneaker.remove().exec();
		const currentSession = await mongoose.startSession();
		currentSession.startTransaction();
		await sneaker.remove({ session: currentSession });
		sneaker.creator.sneakers.pull(sneaker);
		await sneaker.creator.save({ session: currentSession });
		await currentSession.commitTransaction();
	} catch (err) {
		const error = new HttpError("Something went wrong, could not delete sneaker.", 500);
		return next(error);
	}

	res.status(200).json({ message: "Deleted sneaker." });
};

exports.getSneakerById = getSneakerById;
exports.getSneakersByUserId = getSneakersByUserId;
exports.createSneaker = createSneaker;
exports.updateSneaker = updateSneaker;
exports.deleteSneaker = deleteSneaker;
