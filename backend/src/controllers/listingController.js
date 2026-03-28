import User from "../models/user.js";
import { createListingService } from "../services/listingService.js";
import { getAllListings } from "../services/listingService.js";
import { getListingByIdService } from "../services/listingService.js";
import { getListingsByLenderService } from "../services/listingService.js";
import { updateListingService } from "../services/listingService.js";
import { deleteListingService } from "../services/listingService.js";
import { deleteListingImageService } from "../services/listingService.js";
import { validateText } from "../utils/textFilter.js";
import fs from "fs"; 
import { moderateImage } from "../utils/moderation.js"; 

export const createListing = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!validateText(title)) {
      return res.status(400).json({
        success: false,
        message: "Your title contains inappropriate language or forbidden contact information (e.g., phone numbers).",
      });
    }

    if (!validateText(description)) {
      return res.status(400).json({
        success: false,
        message: "Your description contains inappropriate language or forbidden contact information.",
      });
    }

    const listingData = req.body;
    listingData.lenderId = req.user._id;
    const listing = await createListingService(listingData);

 const userId = req.user._id || req.user.id;
    await User.findByIdAndUpdate(userId, { $inc: { adsPostedCount: 1 } });

    res.status(201).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getListings = async (req, res) => {
  try {
    const listings = await getAllListings();

    const safeListings = listings.map(listing => {
      const listingData = listing.toObject ? listing.toObject() : listing;
      
      if (listingData.images) {
        listingData.images = listingData.images.filter(img => img.status === 'approved');
      }
      
      return listingData;
    });

    res.status(200).json({
      success: true,
      data: safeListings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleListing = async (req, res) => {
  try {
    const listingId = req.params.id; 
    const listing = await getListingByIdService(listingId);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found.",
      });
    }

    const safeListing = listing.toObject ? listing.toObject() : listing;
    
    if (safeListing.images) {
      safeListing.images = safeListing.images.filter(img => img.status === 'approved');
    }

    res.status(200).json({
      success: true,
      data: safeListing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLenderListings = async (req, res) => {
  try {
    const lenderId = req.params.lenderId; 
    
    const listings = await getListingsByLenderService(lenderId);

    res.status(200).json({
      success: true,
      count: listings.length, 
      data: listings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listingId = req.params.id; 
    const newData = req.body; 

    // --- THE FIX: ADD TEXT VALIDATION HERE ---
    if (newData.title && !validateText(newData.title)) {
      return res.status(400).json({
        success: false,
        message: "Your updated title contains inappropriate language or forbidden words.",
      });
    }

    if (newData.description && !validateText(newData.description)) {
      return res.status(400).json({
        success: false,
        message: "Your updated description contains inappropriate language or forbidden words.",
      });
    }
    // ------------------------------------------

    const updatedListing = await updateListingService(listingId, newData);

    if (!updatedListing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedListing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteListing = async (req, res) => {
  try {
    const listingId = req.params.id; 

    const deletedListing = await deleteListingService(listingId);

    if (!deletedListing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadListingImages = async (req, res) => {
  try {
    const listingId = req.params.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images provided." });
    }

    const processedImages = [];
    let rejectedCount = 0;

    for (const file of req.files) {
      const aiDecision = await moderateImage(file.path);

      if (aiDecision === 'rejected') {
        fs.unlinkSync(file.path);
        rejectedCount++;
      } else {
        processedImages.push({
          url: `/uploads/listings/${file.filename}`,
          status: aiDecision 
        });
      }
    }

    if (processedImages.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "All uploaded images were rejected due to inappropriate or violent content." 
      });
    }

    // --- THE LOGIC BRIDGE ---
    let finalListingStatus = 'active'; 

    if (processedImages.some(img => img.status === 'pending')) {
      finalListingStatus = 'pending';
    }

    const updatedListing = await updateListingService(listingId, { 
      $push: { images: { $each: processedImages } },
      status: finalListingStatus
    });

    res.status(200).json({
      success: true,
      message: `Successfully processed images. Saved: ${processedImages.length} | Rejected: ${rejectedCount}`,
      data: updatedListing,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/listings/:id/images
export const deleteListingImage = async (req, res) => {
  try {
    const listingId = req.params.id;
    const { imageUrl } = req.body; 

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "Please provide the imageUrl to delete." });
    }

    
    try {
      
      const filePath = `.${imageUrl}`; 
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); 
      }
    } catch (fileError) {
      console.log("Could not delete physical file, but will proceed to remove from database:", fileError);
    }

    
    const updatedListing = await deleteListingImageService(listingId, imageUrl);

    if (!updatedListing) {
      return res.status(404).json({ success: false, message: "Listing not found." });
    }

    res.status(200).json({
      success: true,
      message: "Image successfully deleted from listing.",
      data: updatedListing
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};