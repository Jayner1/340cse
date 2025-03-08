const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const validate = require("../utilities/inventory-validation"); 

router.get("/", utilities.checkLogin, utilities.handleErrors(invController.managementView));

router.get("/management", utilities.handleErrors(invController.managementView));
router.get("/classification/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:vehicleId", utilities.handleErrors(invController.getVehicleDetails));
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.post("/add-classification", utilities.handleErrors(invController.addClassification));
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.post("/add-inventory", utilities.handleErrors(invController.addInventory));
router.get("/getInventory/:classificationId", utilities.handleErrors(invController.getInventoryJSON));
router.get("/edit/:inv_id", utilities.checkLogin, utilities.handleErrors(invController.buildEditInventoryView));
router.post("/update/", validate.inventoryRules(), validate.checkUpdateData, utilities.handleErrors(invController.updateInventory));

router.get("/delete/:inv_id", 
  utilities.checkLogin, 
  utilities.handleErrors(invController.buildDeleteConfirmation) 
);

router.post("/delete/:inv_id", 
  utilities.checkLogin, 
  utilities.handleErrors(invController.processDeleteInventory) 
);

module.exports = router;