const express = require("express");
const boardsController = require("../controllers/boardsController");

const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Create a new board
router.post(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  boardsController.createBoard
);

// Get all boards
router.get(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 2", "ADMIN 1"]),
  boardsController.getBoards
);

// Update a board by ID
router.put(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  boardsController.updateBoard
);

// Delete a board by ID
router.delete(
  "/:board_id",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  boardsController.deleteBoard
);

module.exports = router;
