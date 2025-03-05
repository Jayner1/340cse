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

  async function checkExistingEmail(account_email){
    try {
      const sql = "SELECT * FROM account WHERE account_email = $1"
      const email = await pool.query(sql, [account_email])
      return email.rowCount
    } catch (error) {
      return error.message
    }
  }

  async function getAccountByEmail (account_email) {
    try {
      const result = await pool.query(
        'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
        [account_email])
      return result.rows[0]
    } catch (error) {
      return new Error("No matching email found")
    }
  }

  module.exports = {
    registerAccount,
    checkExistingEmail,
    getAccountByEmail
  };
  
