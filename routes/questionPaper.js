const express = require("express");
const router = express.Router();
const questionPaperController = require("../controllers/questionPaperController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Create question paper with sections and instructions
router.post(
  "/question-papers/full",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  questionPaperController.createCompleteQuestionPaper
);
router.get(
  "/question-paper/:paper_id",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 2", "ADMIN 1"]),
  questionPaperController.getQuestionPaperDetails
);
router.delete(
  "/delete/:paper_id",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  questionPaperController.deleteQuestionPaper
);
router.post(
  "/upload-logo/:paper_id",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  questionPaperController.upload,
  questionPaperController.uploadLogo
);

module.exports = router;
