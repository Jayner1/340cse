const pool = require('../database/index');  

async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password) VALUES ($1, $2, $3, $4) RETURNING *";
        const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);

      return result.rows[0]; 
    } catch (error) {
      console.error('Error registering account:', error);
      throw new Error('Error registering account: ' + error.message);
    }
  }
  
  module.exports = {
    registerAccount
  };
  
