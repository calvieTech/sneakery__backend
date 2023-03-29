const express = require("express");
const { check } = require("express-validator");
const { fileUploadSneakers } = require("../middleware/file-upload");

const sneakersControllers = require("../controllers/sneakers-controllers");

const router = express.Router();

router.get("/:pid", sneakersControllers.getSneakerById);

router.get("/user/:uid", sneakersControllers.getSneakersByUserId);

router.post(
	"/",
	fileUploadSneakers.single("sneakerImg"),
	check("title").not().isEmpty(),
	check("description").isLength({ min: 5 }),
	check("address").not().isEmpty(),
	sneakersControllers.createSneaker
);

router.patch(
	"/:pid",
	check("title").not().isEmpty(),
	check("description").isLength({ min: 5 }),
	sneakersControllers.updateSneaker
);

router.delete("/:pid", sneakersControllers.deleteSneaker);

module.exports = router;
