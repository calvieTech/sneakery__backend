const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const MIME_TYPE_MAP = {
	"image/png": "png",
	"image/jpeg": "jpeg",
	"image/jpg": "jpg",
};
/*
 * Create a multer instance that accepts an options object
 */
const fileUpload = multer({
	limits: 1000000,
	storage: multer.diskStorage({
		/*
		 * destination: function that will specify the folder to which the file will been saved to
		 */
		destination: (req, file, cb) => {
			cb(null, "uploads/avatars");
		},

		/*
		 * filename: a function that will specify name of the file and extension within the destination
		 */
		filename: (req, file, cb) => {
			const extension = MIME_TYPE_MAP[file.mimetype];
			cb(null, uuidv4() + "." + extension);
		},

		/*
		 * fileFilter: function to control which files are valid and accepted
		 */
		fileFilter: (req, file, cb) => {
			// without the '!!' the following line will return undefined
			const isFileValid = !!MIME_TYPE_MAP[file.mimetype];
			let error = isFileValid ? null : new Error("Invalid mime type");
			cb(error, isFileValid);
		},
	}),
});

module.exports = fileUpload;
