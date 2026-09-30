const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

router.post(
    "/",
    authenticateToken,
    authorizeRole("ADMIN"),
    userController.createUser
);

router.get(
    "/",
    authenticateToken,
    authorizeRole("ADMIN"),
    userController.getUsers
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("ADMIN"),
    userController.deleteUser
);

module.exports = router;
