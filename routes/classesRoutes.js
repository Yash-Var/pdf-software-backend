const express = require("express");
const classesController = require("../controllers/classesController");

const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
// Create a new class
router.post(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  classesController.createClass
);

// Get all classes
router.get(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 2", "ADMIN 1"]),
  classesController.getClasses
);

// Get classes by board_id
router.post(
  "/byBoardId",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 2", "ADMIN 1"]),
  classesController.getClassesByBoardIds
);

// Update a class
router.put(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  classesController.updateClass
);

// Delete a class by ID
router.delete(
  "/:class_id",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  classesController.deleteClass
);

module.exports = router;
