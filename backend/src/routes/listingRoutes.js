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
import { checkAdLimit } from "../middlewares/subscriptionMiddleware.js";

const router = express.Router();

router.post("/create", protect, checkAdLimit, createListing);
router.post("/", protect, checkAdLimit, createListing);
router.get("/", getListings);
router.get("/lender/:lenderId", getLenderListings);
router.get("/:id", getSingleListing);
router.put("/:id", protect, updateListing);
router.delete("/:id", protect, deleteListing);
router.delete("/:id/images", deleteListingImage);
router.post("/:id/images", upload.array("images", 5), uploadListingImages);

export default router;