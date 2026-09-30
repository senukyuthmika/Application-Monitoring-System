const express = require("express");

const router = express.Router();

const authenticateToken =
require("../middleware/authMiddleware");

const monitoringController =
require("../controllers/monitoringController");



router.post(
    "/check/:id",
    authenticateToken,
    monitoringController.checkApplication
);

router.get(
    "/dashboard",
    authenticateToken,
    monitoringController.getDashboard
);

router.get(
    "/history",
    authenticateToken,
    monitoringController.getMonitoringHistory
);

router.get(
    "/alerts",
    authenticateToken,
    monitoringController.getAlerts
);

router.patch(
    "/alerts/:id/resolve",
    authenticateToken,
    monitoringController.resolveAlert
);

router.get(
    "/logs",
    authenticateToken,
    monitoringController.getLogs
);



module.exports = router;
