const express = require("express");
const router = express.Router();
const modulesController = require("../controllers/moduleController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Get all modules
router.get(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1", "ADMIN 2"]),
  modulesController.getAllModules
);

// Get a specific module by ID
router.get(
  "/:id",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1", "ADMIN 2"]),
  modulesController.getModuleById
);

// Create a new module
router.post(
  "/",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  modulesController.createModule
);

// Update an existing module
router.put(
  "/:id",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  modulesController.updateModule
);

// Delete a module
router.delete(
  "/:id",
  authenticate,
  authorize(["SUPER ADMIN", "ADMIN 1"]),
  modulesController.deleteModule
);

module.exports = router;
