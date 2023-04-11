const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

const token_auth = (req, res, next) => {
	if (req.method === "OPTIONS") {
		return next();
	}

	let token;
	try {
		token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
		if (!token) {
			const error = new HttpError("Authezntication failed!");
			throw error;
		}

		// validate the token
		const decodedToken = jwt.verify(token, `${process.env.JSON_PRIVATE_TOKEN}`);
		// add data to request and let it continue
		req.userData = { userId: decodedToken.userId };
		next();
	} catch (err) {
		const error = new HttpError("Authentication failed!", 401);
		return next(error.message);
	}
};

module.exports = token_auth;
