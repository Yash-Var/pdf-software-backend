const express = require("express");
const chaptersController = require("../controllers/chaptersController");

const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
// Create a new chapter
router.post(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  chaptersController.createChapter
);

// Get all chapters
router.get(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 2", "ADMIN 1"]),
  chaptersController.getChapters
);

// Get chapters by multiple subject_ids
router.post(
  "/bySubjectIds",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1", "ADMIN 2"]),
  chaptersController.getChaptersBySubjectIds
);

// Update a chapter
router.put(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  chaptersController.updateChapter
);

// Delete a chapter by ID
router.delete(
  "/:chapter_id",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  chaptersController.deleteChapter
);

module.exports = router;
