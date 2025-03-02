const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const { validateClassificationName, validateInventoryData } = require("../middleware/validationMiddleware");
const utilities = require("../utilities");

router.get("/", invController.managementView);  
router.get("/management", invController.managementView); 
router.get("/classification/:classificationId", invController.buildByClassificationId);
router.get("/detail/:vehicleId", invController.getVehicleDetails);

router.get("/add-classification", invController.buildAddClassification);
router.post("/add-classification", validateClassificationName, invController.addClassification);

router.get("/add-inventory", invController.buildAddInventory);
router.post("/add-inventory", validateInventoryData, invController.addInventory);

module.exports = router;