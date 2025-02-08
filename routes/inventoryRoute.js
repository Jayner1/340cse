const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

router.get("/type/:classificationId", invController.buildByClassificationId);

router.get('/api/inventory/:classificationId', invController.getInventoryData)

router.get('/inventory/detail/:itemId', invController.buildInventoryDetail);  

module.exports = router;