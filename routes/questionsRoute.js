const express = require("express");
const Question = require("../controllers/questionsController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new class
router.post(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  Question.createQuestion
);
router.post(
  "/fetch",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1", "ADMIN 2"]),
  Question.fetchQuestions
);
router.post(
  "/upload-photo",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  Question.uploadMiddleware,
  Question.uploadPhoto
);
router.put(
  "/update",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  Question.updateQuestion
);
router.delete("/delete/:question_id", Question.deleteQuestion);
router.get(
  "/stats",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1", "ADMIN 2"]),
  Question.getQuestionStats
);
router.post(
  "/auto-questions",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 2", "ADMIN 1"]),
  Question.getFilteredQuestions
);
router.get(
  "/used",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1", "ADMIN 2"]),
  Question.fetchusedQuestions
);

module.exports = router;
