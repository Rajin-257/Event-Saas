// @desc    Home page
// @route   GET /
// @access  Public
exports.getIndex = (req, res) => {
  res.render("frontend/index", {
    title: "Welcome",
    user: req.user || {},
  });
};
