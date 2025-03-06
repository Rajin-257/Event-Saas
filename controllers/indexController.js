const FrontData = require("../models/frontpage");
const MenuSettings = require("../models/menusetting");

exports.getIndex = async (req, res) => {
  try {
    const frontpageData = await FrontData.findOne({
      where: { id: 1 },
    });

    const menuSettings = await MenuSettings.findOne({
      where: { id: 1 },
    });

    res.render("frontend/index", {
      title: frontpageData?.title || "Welcome",
      user: req.user || {},
      frontData: frontpageData || {},
      menuSettings: menuSettings || {},
    });
  } catch (error) {
    console.error("Error fetching data for index page:", error);
    res.render("frontend/index", {
      title: "Welcome",
      user: req.user || {},
      frontData: {},
      menuSettings: {},
    });
  }
};
