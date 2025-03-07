const Guest = require("../models/guest");
const Department = require("../models/department");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const FrontpageSettings = require("../models/frontpage");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../public/uploads/guests");

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `guest-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Export multer upload middleware for routes
exports.uploadGuestImage = upload.single("picture");

/* =============== GUEST CONTROLLERS =============== */

// Get all guests
exports.getGuestDetails = async (req, res) => {
  try {
    const frontpageData = await FrontpageSettings.findOne({
      where: { id: 1 },
    });

    // Get all departments for the dropdown
    const departments = await Department.findAll({
      order: [["name", "ASC"]],
    });

    // Get all guests with their department information
    const guests = await Guest.findAll({
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Add department name to each guest for easier display in the view
    const guestsWithDept = guests.map((guest) => {
      const plainGuest = guest.get({ plain: true });
      if (plainGuest.Department) {
        plainGuest.departmentName = plainGuest.Department.name;
      }
      return plainGuest;
    });

    res.render("backend/guest/guest-details", {
      title: "Guests",
      subtitle: "Management",
      guests: guestsWithDept,
      departments: departments,
      frontData: frontpageData || {},
      formData: req.user || {},
    });
  } catch (error) {
    console.error("Error fetching guests:", error);
    req.flash("error", "Failed to fetch guests");
    res.redirect("/dashboard");
  }
};

// Get single guest by ID
exports.getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    res.status(200).json({
      success: true,
      data: guest,
    });
  } catch (error) {
    console.error("Error fetching guest:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch guest details",
    });
  }
};

// Create new guest
exports.createGuest = async (req, res) => {
  try {
    const {
      name,
      department,
      designation,
      organization,
      description,
      soc_youtube,
      soc_fb,
      soc_insta,
      soc_tiktok,
      soc_likee,
    } = req.body;

    // Validate department exists
    const departmentExists = await Department.findByPk(department);
    if (!departmentExists) {
      req.flash("error", "Selected department does not exist");
      return res.redirect("/settings/guests");
    }

    // Process boolean checkbox values
    const soc_youtube_status =
      req.body.soc_youtube_status === "on" ||
      req.body.soc_youtube_status === true;
    const soc_fb_status =
      req.body.soc_fb_status === "on" || req.body.soc_fb_status === true;
    const soc_insta_status =
      req.body.soc_insta_status === "on" || req.body.soc_insta_status === true;
    const soc_tiktok_status =
      req.body.soc_tiktok_status === "on" ||
      req.body.soc_tiktok_status === true;
    const soc_likee_status =
      req.body.soc_likee_status === "on" || req.body.soc_likee_status === true;

    // Handle file upload if there's any
    let picture = null;
    if (req.file) {
      picture = `/uploads/guests/${req.file.filename}`;
    }

    // Create new guest
    const guest = await Guest.create({
      name,
      picture,
      department,
      designation,
      organization,
      description,
      soc_youtube,
      soc_fb,
      soc_insta,
      soc_tiktok,
      soc_likee,
      soc_youtube_status,
      soc_fb_status,
      soc_insta_status,
      soc_tiktok_status,
      soc_likee_status,
    });

    req.flash("success", "Guest created successfully");
    res.redirect("/settings/guests");
  } catch (error) {
    console.error("Error creating guest:", error);
    req.flash("error", "Failed to create guest");
    res.redirect("/settings/guests");
  }
};

// Update guest
exports.updateGuest = async (req, res) => {
  try {
    const {
      name,
      department,
      designation,
      organization,
      description,
      soc_youtube,
      soc_fb,
      soc_insta,
      soc_tiktok,
      soc_likee,
    } = req.body;

    // Validate department exists
    if (department) {
      const departmentExists = await Department.findByPk(department);
      if (!departmentExists) {
        req.flash("error", "Selected department does not exist");
        return res.redirect("/settings/guests");
      }
    }

    // Process boolean checkbox values
    const soc_youtube_status =
      req.body.soc_youtube_status === "on" ||
      req.body.soc_youtube_status === true;
    const soc_fb_status =
      req.body.soc_fb_status === "on" || req.body.soc_fb_status === true;
    const soc_insta_status =
      req.body.soc_insta_status === "on" || req.body.soc_insta_status === true;
    const soc_tiktok_status =
      req.body.soc_tiktok_status === "on" ||
      req.body.soc_tiktok_status === true;
    const soc_likee_status =
      req.body.soc_likee_status === "on" || req.body.soc_likee_status === true;

    const guest = await Guest.findByPk(req.params.id);

    if (!guest) {
      req.flash("error", "Guest not found");
      return res.redirect("/settings/guests");
    }

    // Update guest data
    const updateData = {
      name,
      department,
      designation,
      organization,
      description,
      soc_youtube,
      soc_fb,
      soc_insta,
      soc_tiktok,
      soc_likee,
      soc_youtube_status,
      soc_fb_status,
      soc_insta_status,
      soc_tiktok_status,
      soc_likee_status,
    };

    // Handle file upload if there's any
    if (req.file) {
      // Delete old image if exists
      if (guest.picture && guest.picture !== null) {
        const oldImagePath = path.join(__dirname, "../public", guest.picture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.picture = `/uploads/guests/${req.file.filename}`;
    }

    await guest.update(updateData);

    req.flash("success", "Guest updated successfully");
    res.redirect("/settings/guests");
  } catch (error) {
    console.error("Error updating guest:", error);
    req.flash("error", "Failed to update guest");
    res.redirect("/settings/guests");
  }
};

// Delete guest
exports.deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);

    if (!guest) {
      req.flash("error", "Guest not found");
      return res.redirect("/settings/guests");
    }

    // Delete image if exists
    if (guest.picture && guest.picture !== null) {
      const imagePath = path.join(__dirname, "../public", guest.picture);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await guest.destroy();
    req.flash("success", "Guest deleted successfully");
    res.redirect("/settings/guests");
  } catch (error) {
    console.error("Error deleting guest:", error);
    req.flash("error", "Failed to delete guest");
    res.redirect("/settings/guests");
  }
};

/* =============== DEPARTMENT CONTROLLERS =============== */

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      order: [["name", "ASC"]],
    });

    // Get count of guests per department
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const count = await Guest.count({
          where: { department: dept.id },
        });

        const deptData = dept.get({ plain: true });
        deptData.guestCount = count;
        return deptData;
      }),
    );

    res.render("backend/guest/departments", {
      title: "Departments",
      subtitle: "Management",
      departments: departmentsWithStats,
      formData: req.user || {},
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    req.flash("error", "Failed to fetch departments");
    res.redirect("/dashboard");
  }
};

// Get single department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department details",
    });
  }
};

// Create new department
exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      req.flash("error", "Department name is required");
      return res.redirect("/settings/guests");
    }

    // Check if department with same name already exists
    const existingDepartment = await Department.findOne({
      where: {
        name: {
          [Op.like]: name,
        },
      },
    });

    if (existingDepartment) {
      req.flash("error", "A department with this name already exists");
      return res.redirect("/settings/guests");
    }

    // Create new department
    await Department.create({ name });

    req.flash("success", "Department created successfully");
    res.redirect("/settings/guests");
  } catch (error) {
    console.error("Error creating department:", error);
    req.flash("error", "Failed to create department");
    res.redirect("/settings/guests");
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      req.flash("error", "Department name is required");
      return res.redirect("/settings/departments");
    }

    const department = await Department.findByPk(req.params.id);

    if (!department) {
      req.flash("error", "Department not found");
      return res.redirect("/settings/departments");
    }

    // Check if department with same name already exists (excluding current one)
    const existingDepartment = await Department.findOne({
      where: {
        name: {
          [Op.like]: name,
        },
        id: {
          [Op.ne]: department.id,
        },
      },
    });

    if (existingDepartment) {
      req.flash("error", "A department with this name already exists");
      return res.redirect("/settings/departments");
    }

    await department.update({ name });

    req.flash("success", "Department updated successfully");
    res.redirect("/settings/departments");
  } catch (error) {
    console.error("Error updating department:", error);
    req.flash("error", "Failed to update department");
    res.redirect("/settings/departments");
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      req.flash("error", "Department not found");
      return res.redirect("/settings/departments");
    }

    // Check if department is being used by any guests
    const guestsUsingDepartment = await Guest.count({
      where: { department: department.id },
    });

    if (guestsUsingDepartment > 0) {
      req.flash(
        "error",
        `Cannot delete the department. It is assigned to ${guestsUsingDepartment} guest(s).`,
      );
      return res.redirect("/settings/departments");
    }

    await department.destroy();
    req.flash("success", "Department deleted successfully");
    res.redirect("/settings/departments");
  } catch (error) {
    console.error("Error deleting department:", error);
    req.flash("error", "Failed to delete department");
    res.redirect("/settings/departments");
  }
};
