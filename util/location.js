const axios = require("axios");
require("dotenv").config();
const HttpError = require("../models/http-error");
const GOOGLE_MAPS_API = process.env.GOOGLE_MAPS_API;

async function getCoordsForAddress(address) {
	// return {
	//   lat: 40.7484474,
	//   lng: -73.9871516
	// };

	const response = await axios.get(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
			address
		)}&key=${GOOGLE_MAPS_API}`
	);
	console.log(`\n [DEBUG] resBackEnd: `, response);

	const data = response.data;

	if (!data || data.status === "ZERO_RESULTS") {
		const error = new HttpError("Could not find location for the specified address.", 422);
		throw error;
	}

	console.log(`\n [DEBUG] data Backend: `, data);
	const coordinates = data.results[0].geometry.location;

	return coordinates;
}

module.exports = getCoordsForAddress;
