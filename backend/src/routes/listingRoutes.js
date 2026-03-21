import express from "express";
import { createListing } from "../controllers/listingController.js";
import { getListings } from "../controllers/listingController.js";
import { getLenderListings } from "../controllers/listingController.js";
import { getSingleListing } from "../controllers/listingController.js";
import { updateListing } from "../controllers/listingController.js";
import { deleteListing } from "../controllers/listingController.js";
import upload from "../middlewares/uploadMiddleware.js";
import { uploadListingImages } from "../controllers/listingController.js";
import { deleteListingImage } from "../controllers/listingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createListing);
router.get("/", getListings);
router.get("/lender/:lenderId", getLenderListings);
router.get("/:id", getSingleListing);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);
router.delete("/:id/images", deleteListingImage);
router.post("/:id/images", upload.array("images", 5), uploadListingImages);

export default router;