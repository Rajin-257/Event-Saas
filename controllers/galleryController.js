// controllers/galleryController.js
const fs = require("fs");
const path = require("path");
const Gallery = require("../models/gallery");
const multer = require("multer");
const FrontpageSettings = require("../models/frontpage");

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../public/uploads/gallery");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Filter for image files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
});

// Get all gallery images
exports.getAllGallery = async (req, res) => {
  try {
    const galleryItems = await Gallery.findAll({
      order: [["createdAt", "DESC"]], // Most recent first
    });
    const frontpageData = await FrontpageSettings.findOne({
      where: { id: 1 },
    });

    res.render("backend/gallery/gallery-image", {
      title: "Gallery",
      subtitle: "Images",
      galleryItems,
      frontData: frontpageData || {},
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    req.flash("error", "Failed to fetch gallery items");
    res.redirect("/user/dashboard");
  }
};

// Add a new gallery image
exports.addGallery = [
  upload.single("image"), // This middleware handles the file upload
  async (req, res) => {
    try {
      // Validate input
      if (!req.file || !req.body.subtitle) {
        req.flash("error", "Image and subtitle are required");
        return res.redirect("/settings/gallery");
      }

      // Create relative path to store in database
      const imagePath = `/uploads/gallery/${path.basename(req.file.path)}`;

      // Create new gallery entry
      await Gallery.create({
        subtitle: req.body.subtitle,
        image: imagePath,
      });

      req.flash("success", "Image added to gallery successfully");
      res.redirect("/settings/gallery");
    } catch (error) {
      console.error("Error adding gallery item:", error);
      req.flash("error", "Failed to add image to gallery");
      res.redirect("/settings/gallery");
    }
  },
];

// Delete a gallery image
exports.deleteGallery = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      req.flash("error", "Invalid gallery item ID");
      return res.redirect("/settings/gallery");
    }

    // Find the gallery item to get the image path
    const galleryItem = await Gallery.findByPk(id);

    if (!galleryItem) {
      req.flash("error", "Gallery item not found");
      return res.redirect("/settings/gallery");
    }

    // Delete the image file from filesystem
    const imagePath = path.join(__dirname, "../public", galleryItem.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete the record from database
    await galleryItem.destroy();

    req.flash("success", "Gallery item deleted successfully");
    res.redirect("/settings/gallery");
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    req.flash("error", "Failed to delete gallery item");
    res.redirect("/settings/gallery");
  }
};
