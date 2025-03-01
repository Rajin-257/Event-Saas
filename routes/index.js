import express from "express";

import frontend_pages from "./frontend_pages.js";
import backend_pages from "./backend_pages.js";
const router = express.Router();

router.use("/", frontend_pages);
router.use("/auth", backend_pages);

export default router;
