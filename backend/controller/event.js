const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Shop = require("../model/shop");
const Event = require("../model/event");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller, isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const cloudinary = require("cloudinary");

// Create Event Route
router.post(
  "/create-event",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId, images, ...eventData } = req.body;
      const shop = await Shop.findById(shopId);

      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      }

      const imagesLinks = await Promise.all(
        images.map(async (image) => {
          const result = await cloudinary.v2.uploader.upload(image, {
            folder: "products",
          });
          return {
            public_id: result.public_id,
            url: result.secure_url,
          };
        })
      );

      eventData.images = imagesLinks;
      eventData.shop = shop;

      const event = await Event.create(eventData);

      res.status(201).json({
        success: true,
        event,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  })
);

// Get All Events Route
router.get("/get-all-events", async (req, res, next) => {
  try {
    const events = await Event.find();
    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 400));
  }
});

// Get All Events of a Shop Route
router.get(
  "/get-all-events/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find({ shopId: req.params.id });
      res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  })
);

// Delete Event Route
router.delete(
  "/delete-event/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return next(new ErrorHandler("Event not found", 404));
      }

      for (let i = 0; i < event.images.length; i++) {
        await cloudinary.v2.uploader.destroy(event.images[i].public_id);
      }

      await event.remove();

      res.status(200).json({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  })
);

// Admin All Events Route
router.get(
  "/admin-all-events",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
