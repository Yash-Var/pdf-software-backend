const express = require("express");
const boardsRoutes = require("./boardsRoutes");
const classesRoutes = require("./classesRoutes");
const subjectsRoutes = require("./subjectsRoutes");
const chaptersRoutes = require("./chaptersRoutes");
const tropicsRoutes = require("./tropicsRoutes");
const questionsRoutes = require("./questionsRoute");
const questionPaperRoutes = require("./questionPaper");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/boards", boardsRoutes);
router.use("/classes", classesRoutes);
router.use("/subjects", subjectsRoutes);
router.use("/chapters", chaptersRoutes);
router.use("/tropics", tropicsRoutes);
router.use("/questions", questionsRoutes);
router.use("/paper", questionPaperRoutes);
router.use("/user", userRoutes);

module.exports = router;
