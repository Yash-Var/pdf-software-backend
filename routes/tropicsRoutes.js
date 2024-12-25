const express = require("express");
const tropicsController = require("../controllers/tropicsController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new tropic
router.post(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  tropicsController.createTropic
);

// Get all tropics
router.get(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1", "ADMIN 2"]),
  tropicsController.getTropics
);

// Get tropics by multiple chapter_ids
router.post(
  "/byChapterIds",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1", "ADMIN 2"]),
  tropicsController.getTropicsByChapterIds
);

// Update a tropic
router.put(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  tropicsController.updateTropic
);

// Delete a tropic by ID
router.delete(
  "/:tropic_id",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  tropicsController.deleteTropic
);

module.exports = router;
