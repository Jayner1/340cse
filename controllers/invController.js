const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view (Server-Side Rendering)
 * *************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;  // Use the classification name from the query
    res.render("./inventory/classification", {
      title: `${className} vehicles`,  // Dynamically set title based on classification
      nav,
      grid,
    });
  } catch (err) {
    console.error("Error building classification view", err);
    next(err);
  }
}

invCont.buildInventoryDetail = async function (req, res, next) {
  try {
    const itemId = req.params.itemId;
    console.log("Fetching item with ID:", itemId); // Log the itemId

    // Fetch the item data
    const itemData = await invModel.getInventoryItemById(itemId);

    // Check if the item exists
    if (!itemData) {
      console.log("Item not found for ID:", itemId); // Log if the item is not found
      return res.status(404).render('./inventory/detail', { 
        title: "Item Not Found", 
        nav: await utilities.getNav(), 
        item: null 
      });
    }

    // Fetch the navigation bar HTML
    let nav = await utilities.getNav();

    // Use the new utility function to build the item detail HTML
    const itemDetailHTML = utilities.buildInventoryDetailHTML(itemData);

    // Render the page and pass the generated HTML as part of the response
    res.render("./inventory/detail", {
      title: `${itemData.inv_make} ${itemData.inv_model} Details`,  // Dynamically set title
      nav,
      itemDetailHTML,  // Pass the generated detail HTML to the view
    });
  } catch (err) {
    console.error("Error building inventory detail view", err);
    next(err);
  }
};



/* ***************************
 *  API endpoint to fetch inventory data
 * *************************** */
invCont.getInventoryData = async function (req, res) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    res.json(data)
  } catch (err) {
    console.error("Error fetching inventory data", err)
    res.status(500).json({ error: "Failed to fetch inventory data" })
  }
}

module.exports = invCont;  // Ensure invCont is exported
