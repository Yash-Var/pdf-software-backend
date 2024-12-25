const express = require("express");
const boardsRoutes = require("./boardsRoutes");
const classesRoutes = require("./classesRoutes");
const subjectsRoutes = require("./subjectsRoutes");
const chaptersRoutes = require("./chaptersRoutes");
const tropicsRoutes = require("./tropicsRoutes");
const questionsRoutes = require("./questionsRoute");
const questionPaperRoutes = require("./questionPaper");
const userRoutes = require("./userRoutes");
const modulesRoutes = require("./moduleRoutes");

const router = express.Router();

router.use("/boards", boardsRoutes);
router.use("/classes", classesRoutes);
router.use("/subjects", subjectsRoutes);
router.use("/chapters", chaptersRoutes);
router.use("/tropics", tropicsRoutes);
router.use("/questions", questionsRoutes);
router.use("/paper", questionPaperRoutes);
router.use("/user", userRoutes);
router.use("/modules", modulesRoutes);

module.exports = router;
