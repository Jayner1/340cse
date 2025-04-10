const pool = require("../database/index");

const accountModel = {};

/* *****************************
 * Get account by email
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_password, account_type FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getAccountByEmail error: " + error);
    throw error;
  }
}

/* *****************************
 * Register new account
 * ***************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const result = await pool.query(
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *",
      [account_firstname, account_lastname, account_email, account_password]
    );
    return result.rows[0];
  } catch (error) {
    console.error("registerAccount error: " + error);
    throw error;
  }
}

/* *****************************
 * Check for existing email
 * ***************************** */
async function checkExistingEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT * FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error("checkExistingEmail error: " + error);
    throw error;
  }
}

/* *****************************
 * Get account by ID
 * ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getAccountById error: " + error);
    throw error;
  }
}

/* *****************************
 * Update account information
 * ***************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const result = await pool.query(
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *",
      [account_firstname, account_lastname, account_email, account_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("updateAccount error: " + error);
    throw error;
  }
}

/* *****************************
 * Update account password
 * ***************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const result = await pool.query(
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING account_id",
      [hashedPassword, account_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("updatePassword error: " + error);
    throw error;
  }
}

async function addFavoriteVehicle(account_id, inv_id) {
  try {
      const sql = "INSERT INTO favorite_vehicles (account_id, inv_id) VALUES ($1, $2) RETURNING *";
      const result = await pool.query(sql, [account_id, inv_id]);
      return result.rows[0];
  } catch (error) {
      throw error;
  }
}

async function getFavoriteVehicles(account_id) {
  try {
      const sql = `
          SELECT fv.favorite_id, i.inv_make, i.inv_model, i.inv_year, i.inv_id
          FROM favorite_vehicles fv
          JOIN inventory i ON fv.inv_id = i.inv_id
          WHERE fv.account_id = $1
      `;
      const result = await pool.query(sql, [account_id]);
      return result.rows;
  } catch (error) {
      throw error;
  }
}

async function removeFavoriteVehicle(account_id, inv_id) {
  try {
      const sql = "DELETE FROM favorite_vehicles WHERE account_id = $1 AND inv_id = $2 RETURNING *";
      const result = await pool.query(sql, [account_id, inv_id]);
      return result.rows[0];
  } catch (error) {
      throw error;
  }
}

  module.exports = { 
    getAccountByEmail, 
    registerAccount, 
    getAccountById, 
    updateAccount, 
    updatePassword,
    checkExistingEmail,
    addFavoriteVehicle,
    removeFavoriteVehicle,
    getFavoriteVehicles 
};
