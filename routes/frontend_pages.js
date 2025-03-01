import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  console.log("Working from frontend_pages Router");
  res.render("frontend/index");
});

export default router;
