import express from "express";

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("backend/login");
});

router.get("/recoverpw", (req, res) => {
  res.render("backend/recoverpw");
});

export default router;
