const express = require("express");
const subjectsController = require("../controllers/subjectsController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new subject
router.post(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  subjectsController.createSubject
);

// Get all subjects
router.get(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1", "ADMIN 2"]),
  subjectsController.getSubjects
);

// Get subjects by multiple class_ids
router.post(
  "/byClassIds",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1", "ADMIN 2"]),
  subjectsController.getSubjectsByClassIds
);

// Update a subject
router.put(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  subjectsController.updateSubject
);

// Delete a subject by ID
router.delete(
  "/:subject_id",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  subjectsController.deleteSubject
);

module.exports = router;
