const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  
  if (!data || data.length === 0) {
    let nav = await utilities.getNav()
    return res.render("./errors/error", {
      title: "No Vehicles Found",
      message: "No vehicles match this classification.",
      nav
    });
  }
  
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 * Build vehicle details for specific inventory item
 * ***************************/
invCont.getVehicleDetails = async function (req, res) {
  try {
    const vehicle = await invModel.getVehicleById(req.params.id);
    if (!vehicle) {
      let nav = await utilities.getNav()
      return res.render("./errors/error", {
        title: "404 Error",
        status: 404,
        message: "Vehicle not found.",
        nav
      });
    }
       
    const html = utilities.formatVehicleDetails(vehicle);
    let nav = await utilities.getNav()
    res.render("./inventory/detail", { 
      title: `${vehicle.inv_make} ${vehicle.inv_model} Details`,
      nav,
      vehicle: html 
    });
    
  } catch (error) {
    console.error("Error in getVehicleDetails:", error);
    let nav = await utilities.getNav()
    res.status(500).render("./errors/error", {
      title: "500 Error",
      status: 500,
      message: "An error occurred while fetching vehicle details.",
      nav
    });
  }
}

module.exports = invCont