const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Inventory Management View
 * ************************** */
invCont.managementView = async function (req, res) {
  let nav;
  try {
    nav = await utilities.getNav();
    /* ***************************
     * Space for additional processing
     * Build classification select list for inventory management
     * ************************** */
    const classificationList = await utilities.buildClassificationList();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      message: req.flash("info"),
      classificationList
    });
  } catch (error) {
    console.error("Error loading Inventory Management view:", error);
    res.status(500).render("./errors/error", {
      title: "500 Error",
      status: 500,
      message: "An error occurred while loading the inventory management page.",
      nav: nav || await utilities.getNav(),
    });
  }
};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);

  if (!data || data.length === 0) {
    let nav = await utilities.getNav();
    return res.render("./errors/error", {
      title: "No Vehicles Found",
      message: "No vehicles match this classification.",
      nav,
    });
  }

  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 * Build vehicle details for specific inventory item
 * ************************** */
invCont.getVehicleDetails = async function (req, res) {
  try {
    const vehicle = await invModel.getVehicleById(req.params.vehicleId); 
    if (!vehicle) {
      let nav = await utilities.getNav();
      return res.render("./errors/error", {
        title: "404 Error",
        status: 404,
        message: "Vehicle not found.",
        nav,
      });
    }
    const html = utilities.formatVehicleDetails(vehicle);
    let nav = await utilities.getNav();
    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model} Details`,
      nav,
      vehicle: html,
    });
  } catch (error) {
    console.error("Error in getVehicleDetails:", error);
    let nav = await utilities.getNav();
    res.status(500).render("./errors/error", {
      title: "500 Error",
      status: 500,
      message: "An error occurred while fetching vehicle details.",
      nav,
    });
  }
};

/* ***************************
 * Build the add classification view
 * ************************** */
invCont.buildAddClassification = async (req, res) => {
  let nav = await utilities.getNav();
  const errors = req.flash("error");
  const classificationName = req.flash("classificationName")[0] || "";

  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors,
    classificationName,
  });
};

/* ***************************
 * Add new classification
 * ************************** */
invCont.addClassification = async (req, res) => {
  const { classificationName } = req.body;

  try {
    await invModel.addClassificationToDb(classificationName);
    req.flash("info", "New classification added successfully!");
    res.redirect("/inv/management");
  } catch (error) {
    req.flash("error", error.message || "An error occurred while adding the classification.");
    req.flash("classificationName", classificationName);
    res.redirect("/inv/add-classification");
  }
};

/* ***************************
 * Build the add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
  try {
    const classificationList = await invModel.getClassifications();
    const validClassificationList = Array.isArray(classificationList)
      ? classificationList
      : Object.values(classificationList);
    let nav = await utilities.getNav();
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      classificationList: validClassificationList,
      nav,
      errors: req.flash("error"),
      inv_make: req.flash("inv_make")[0] || "",
      inv_model: req.flash("inv_model")[0] || "",
      inv_year: req.flash("inv_year")[0] || "",
      inv_color: req.flash("inv_color")[0] || "",
      inv_price: req.flash("inv_price")[0] || "",
      inv_miles: req.flash("inv_miles")[0] || "",
      classification_id: req.flash("classification_id")[0] || "",
      currentYear: new Date().getFullYear(),
    });
  } catch (error) {
    console.error("Error in buildAddInventory:", error);
    let nav = await utilities.getNav();
    res.status(500).render("errors/error", {
      title: "500 Error",
      message: "An error occurred while loading the add inventory page.",
      nav,
    });
  }
};

/* ***************************
 * Add New Inventory
 * ************************** */
invCont.addInventory = async function (req, res) {
  const { inv_make, inv_model, inv_year, inv_color, inv_price, inv_miles, classification_id } = req.body;

  try {
    await invModel.addInventoryToDb({
      inv_make,
      inv_model,
      inv_year,
      inv_color,
      inv_price,
      inv_miles,
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_description: "No description provided", 
      classification_id,
    });
    req.flash("info", "New vehicle added successfully!");
    res.redirect("/inv");
  } catch (error) {
    req.flash("error", error.message || "An error occurred while adding the vehicle.");
    res.redirect("/inv/add-inventory");
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classificationId = parseInt(req.params.classificationId); 
  const invData = await invModel.getInventoryByClassificationId(classificationId);
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 * Build the edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();

  const itemData = await invModel.getVehicleById(inv_id);
  const classificationList = await utilities.buildClassificationList(itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList,
    errors: req.flash("error"),
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
    currentYear: new Date().getFullYear()
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description = "No description provided",
    inv_image = "/images/vehicles/no-image.png", 
    inv_thumbnail = "/images/vehicles/no-image-tn.png", 
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      currentYear: new Date().getFullYear()
    });
  }
};

/* ***************************
 * Export all controller functions
 * ************************** */
module.exports = {
  managementView: invCont.managementView,
  buildByClassificationId: invCont.buildByClassificationId,
  getVehicleDetails: invCont.getVehicleDetails,
  buildAddClassification: invCont.buildAddClassification,
  addClassification: invCont.addClassification,
  buildAddInventory: invCont.buildAddInventory,
  addInventory: invCont.addInventory,
  getInventoryJSON: invCont.getInventoryJSON,
  buildEditInventoryView: invCont.buildEditInventoryView,
  updateInventory: invCont.updateInventory
};