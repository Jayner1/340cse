const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const result = await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
    console.log("Classifications result:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("getClassifications error: " + error);
    throw error;
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    console.log(`Query for classification ${classification_id} returned ${data.rows.length} results`);
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
    throw error;
  }
}

/* ***************************
 *  Get specific vehicle by ID
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    console.log("Fetching vehicle with inv_id:", inv_id);
    const data = await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1",
      [inv_id]
    );
    console.log("Query result:", data.rows);
    return data.rows.length > 0 ? data.rows[0] : null;
  } catch (error) {
    console.error("getVehicleById error: " + error);
    throw error;
  }
}

/* ***************************
 *  Add new classification to the database
 * ************************** */
async function addClassificationToDb(classificationName) {
  try {
    const checkExistence = await pool.query(
      "SELECT * FROM public.classification WHERE classification_name = $1",
      [classificationName]
    );

    if (checkExistence.rows.length > 0) {
      throw new Error("Classification name already exists!");
    }

    const query = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(query, [classificationName]);
    console.log(`Added new classification: ${classificationName}`);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding classification: " + error.message);
    throw error;
  }
}

/* ***************************
 *  Add new inventory item to the database
 * ************************** */
const addInventoryToDb = async (vehicle) => {
  const { inv_make, inv_model, inv_year, inv_color, inv_price, inv_miles, inv_image, inv_thumbnail, inv_description, classification_id } = vehicle;

  const query = `
    INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_color, inv_price, inv_miles, inv_image, inv_thumbnail, inv_description, classification_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  const values = [inv_make, inv_model, inv_year, inv_color, inv_price, inv_miles, inv_image, inv_thumbnail, inv_description, classification_id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("addInventoryToDb error: " + error.message);
    throw error;
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
    throw error;
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM public.inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    console.error("deleteInventory error: " + error.message);
    throw new Error("Delete Inventory Error");
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassificationToDb,
  addInventoryToDb,
  updateInventory,
  deleteInventory
};