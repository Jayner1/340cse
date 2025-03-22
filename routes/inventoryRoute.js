const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const validate = require("../utilities/inventory-validation"); 

// Public routes (accessible to all, no login or account type check)
router.get("/classification/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:vehicleId", utilities.handleErrors(invController.getVehicleDetails));
router.get("/getInventory/:classificationId", utilities.handleErrors(invController.getInventoryJSON));

// General management view (public for viewing, actions restricted below)
router.get("/management", utilities.handleErrors(invController.managementView));

// Administrative routes (require Employee or Admin account type)
router.get("/", 
  utilities.checkAdminOrEmployee, 
  utilities.handleErrors(invController.managementView)
);

router.get("/add-classification", 
  utilities.checkAdminOrEmployee, 
  utilities.handleErrors(invController.buildAddClassification)
);
router.post("/add-classification", 
  utilities.checkAdminOrEmployee, 
  utilities.handleErrors(invController.addClassification)
);
router.get("/add-inventory", 
  utilities.checkAdminOrEmployee, 
  utilities.handleErrors(invController.buildAddInventory)
);
router.post("/add-inventory", 
  utilities.checkAdminOrEmployee, 
  utilities.handleErrors(invController.addInventory)
);
router.get("/edit/:inv_id", 
  utilities.checkAdminOrEmployee, 
  utilities.handleErrors(invController.buildEditInventoryView)
);
router.post("/update/", 
  utilities.checkAdminOrEmployee, 
  validate.inventoryRules(), 
  validate.checkUpdateData, 
  utilities.handleErrors(invController.updateInventory)
);
router.get("/delete/:inv_id", 
  utilities.checkAdminOrEmployee, 
  utilities.handleErrors(invController.buildDeleteConfirmation)
);
router.post("/delete/:inv_id", 
  utilities.checkAdminOrEmployee, 
  utilities.handleErrors(invController.processDeleteInventory)
);

module.exports = router;