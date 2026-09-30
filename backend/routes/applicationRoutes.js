const express = require("express");

const router = express.Router();

const applicationController =
    require("../controllers/applicationController");

const authenticateToken =
    require("../middleware/authMiddleware");

const authorizeRole =
    require("../middleware/roleMiddleware");


// Create application
// Admin only
router.post(
    "/",
    authenticateToken,
    authorizeRole("ADMIN"),
    applicationController.createApplication
);


// Get all applications
// Logged-in users
router.get(
    "/",
    authenticateToken,
    applicationController.getApplications
);


// Get application by ID
router.get(
    "/:id",
    authenticateToken,
    applicationController.getApplicationById
);


// Update application
// Admin only
router.put(
    "/:id",
    authenticateToken,
    authorizeRole("ADMIN"),
    applicationController.updateApplication
);


// Delete application
// Admin only
router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("ADMIN"),
    applicationController.deleteApplication
);



module.exports = router;