const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

router.get("/classification/:classificationId", invController.buildByClassificationId);

// router.get("/api/inventory/:classificationId", invController.getInventoryData);

router.get("/detail/:id", invController.getVehicleDetails);

module.exports = router;
