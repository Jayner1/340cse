const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryItemById(itemId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,  // Make sure you're using the correct field, inv_id
      [itemId]
    );
    return data.rows[0];
  } catch (error) {
    console.error("Error fetching inventory item by ID", error);
  }
}



/* ***************************
 *  Get inventory item by ID
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name 
       FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("Error fetching inventory by classification ID", error);
  }
}



// Export all the functions as an object
module.exports = { 
  getClassifications, 
  getInventoryByClassificationId, 
  getInventoryItemById 
}
