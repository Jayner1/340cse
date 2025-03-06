// utilities/inventory-validation.js
const utilities = require(".");
const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");

const validate = {};

/* ******************************
 * Inventory Validation Rules
 * ***************************** */
validate.inventoryRules = () => {
  return [
    body("inv_make").trim().notEmpty().isLength({ min: 1 }).withMessage("Please provide a valid make."),
    body("inv_model").trim().notEmpty().isLength({ min: 1 }).withMessage("Please provide a valid model."),
    body("inv_year").trim().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage("Please provide a valid year."),
    body("inv_color").trim().notEmpty().isLength({ min: 1 }).withMessage("Please provide a valid color."),
    body("inv_price").trim().isFloat({ min: 0 }).withMessage("Please provide a valid price."),
    body("inv_miles").trim().isInt({ min: 0 }).withMessage("Please provide valid mileage."),
    body("classification_id").trim().notEmpty().isInt().withMessage("Please select a valid classification."),
  ];
};

/* ******************************
 * Check inventory data and return errors or continue to add inventory
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_color, inv_price, inv_miles, classification_id } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);
    return res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      inv_make,
      inv_model,
      inv_year,
      inv_color,
      inv_price,
      inv_miles,
      classification_id,
      currentYear: new Date().getFullYear()
    });
  }
  next();
};

/* ******************************
 * Check update data and return errors to edit inventory view or continue
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_id, inv_make, inv_model, inv_year, inv_color, inv_price, inv_miles, classification_id } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    return res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: errors.array(),
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_color,
      inv_price,
      inv_miles,
      classification_id,
      currentYear: new Date().getFullYear()
    });
  }
  next();
};

module.exports = validate;