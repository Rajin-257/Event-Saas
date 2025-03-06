const FrontpageSettings = require("../models/frontpage");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { validationResult } = require("express-validator");
const MenuSettings = require("../models/menusetting");

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../public/uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "favicon", maxCount: 1 },
  { name: "mainPicture", maxCount: 1 },
]);

// Display frontpage settings form
exports.getFrontPageSettings = async (req, res) => {
  try {
    // Try to find existing settings for the user
    let settings = await FrontpageSettings.findOne({
      where: { id: 1 }, // Assuming a single record for frontpage settings
    });

    // If no settings exist, create an empty object
    if (!settings) {
      settings = {};
    }

    res.render("backend/settings/Front-page-setting", {
      title: "Frontpage Settings",
      user: req.user,
      settings: settings,
      // Flash messages are already available via res.locals from middleware
    });
  } catch (error) {
    console.error("Error fetching frontpage settings:", error);
    req.flash("error_msg", "Failed to load frontpage settings");
    res.redirect("/dashboard");
  }
};

// Update frontpage settings
exports.updateFrontPageSettings = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      req.flash("error_msg", `Upload error: ${err.message}`);
      return res.redirect("/settings/frontpage-setting");
    } else if (err) {
      // An unknown error occurred
      req.flash("error_msg", `Error: ${err.message}`);
      return res.redirect("/settings/frontpage-setting");
    }

    try {
      // Process form data
      const {
        title,
        mobile,
        address,
        soc_fb,
        soc_insta,
        soc_youtube,
        webtitle,
      } = req.body;

      // Prepare data for update or creation
      const updateData = {
        title: title || "",
        webtitle: webtitle || "",
        phone: mobile || "",
        office_location: address || "",
        email: req.user.email,
        soc_fb: soc_fb || "https://www.facebook.com/",
        soc_insta: soc_insta || "https://www.instagram.com/",
        soc_youtube: soc_youtube || "https://www.youtube.com/",
      };

      // Handle file uploads if present
      if (req.files) {
        if (req.files.logo && req.files.logo[0]) {
          updateData.Logo = `/uploads/${req.files.logo[0].filename}`;
        }

        if (req.files.favicon && req.files.favicon[0]) {
          updateData.fav = `/uploads/${req.files.favicon[0].filename}`;
        }

        if (req.files.mainPicture && req.files.mainPicture[0]) {
          updateData.main_photo = `/uploads/${req.files.mainPicture[0].filename}`;
        }
      }

      // Find or create settings
      const [settings, created] = await FrontpageSettings.findOrCreate({
        where: { id: 1 },
        defaults: updateData,
      });

      // If record exists, update it
      if (!created) {
        await settings.update(updateData);
      }

      req.flash("success_msg", "Frontpage settings updated successfully");
      res.redirect("/settings/frontpage-setting");
    } catch (error) {
      console.error("Error updating frontpage settings:", error);
      req.flash("error_msg", "Failed to update frontpage settings");
      res.redirect("/settings/frontpage-setting");
    }
  });
};

exports.updateMenuSettings = async (req, res) => {
  try {
    // Extract data from request body
    const {
      web_title,
      menu_status_value,
      address_status_value,
      fb_status_value,
      insta_status_value,
      youtube_status_value,
    } = req.body;

    // Find or create menu settings
    const [menuSettings, created] = await MenuSettings.findOrCreate({
      where: { id: 1 }, // Using ID 1 for site-wide settings instead of user-specific
      defaults: {
        web_title: web_title || "Menu",
        menu_status: menu_status_value === "1",
        address_status: address_status_value === "1",
        fb_status: fb_status_value === "1",
        insta_status: insta_status_value === "1",
        youtube_status: youtube_status_value === "1",
      },
    });

    // If record exists, update it
    if (!created) {
      await menuSettings.update({
        web_title: web_title || menuSettings.web_title,
        menu_status: menu_status_value === "1",
        address_status: address_status_value === "1",
        fb_status: fb_status_value === "1",
        insta_status: insta_status_value === "1",
        youtube_status: youtube_status_value === "1",
      });
    }

    req.flash("success_msg", "Menu settings updated successfully");
    res.redirect("/settings/menu-setting");
  } catch (error) {
    console.error("Error updating menu settings:", error);
    req.flash("error_msg", "Failed to update menu settings");
    res.redirect("/settings/menu-setting");
  }
};

// Update the existing getMenuSettings method to fetch menu settings
exports.getMenuSettings = async (req, res) => {
  try {
    // Try to find existing menu settings by ID 1
    let menuSettings = await MenuSettings.findOne({
      where: { id: 1 }, // Using ID 1 for site-wide settings instead of user-specific
    });

    // If no settings exist, create an empty object
    if (!menuSettings) {
      menuSettings = {
        web_title: "Menu",
        menu_status: false,
        address_status: false,
        fb_status: false,
        insta_status: false,
        youtube_status: false,
      };
    }

    res.render("backend/settings/menu-setting", {
      title: "Menu Settings",
      user: req.user,
      menuSettings: menuSettings,
      // Flash messages are already available via res.locals from middleware
    });
  } catch (error) {
    console.error("Error fetching menu settings:", error);
    req.flash("error_msg", "Failed to load menu settings");
    res.redirect("/dashboard");
  }
};
