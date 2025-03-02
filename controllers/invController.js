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
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      message: req.flash("info"),
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

module.exports = invCont;