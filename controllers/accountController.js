const utilities = require("../utilities"); 
const accountModel = require('../models/account-model'); 
const pool = require('../database/index'); 


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav(); 
    const flashMessage = req.flash('notice'); 
    res.render("account/login", {
      title: "Login",
      nav,
      flashMessage,  
    });
  } catch (error) {
    next(error); 
  }
}

async function buildRegister(req, res, next) {
    try {
        let nav = await utilities.getNav(); 
        const flashMessage = req.flash('notice'); 
        res.render("account/register", {
            title: "Register",
            nav,
            flashMessage, 
        });
    } catch (error) {
        next(error); 
    }
}

/* ****************************************
*  Login Account (for fake data)
* *************************************** */
async function loginAccount(req, res) {
    const { account_email, account_password } = req.body;
  
    try {
      const sql = "SELECT * FROM account WHERE account_email = $1";
      const result = await pool.query(sql, [account_email]);
  
      if (result.rows.length === 0) {
        req.flash("notice", "Invalid email or password.");
        return res.status(401).redirect("/account/login");
      }
  
      const user = result.rows[0]; 
  
      if (user.account_password === account_password) {
        req.session.user = user;
        req.flash("notice", "Login successful!");
        return res.redirect("/"); 
      } else {
        req.flash("notice", "Invalid email or password.");
        return res.status(401).redirect("/account/login");
      }
    } catch (error) {
      console.error("Error during login:", error);
      req.flash("notice", "An error occurred. Please try again.");
      return res.status(500).redirect("/account/login");
    }
  }
  
/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    if (!account_firstname || !account_lastname || !account_email || !account_password) {
        req.flash("notice", "All fields are required.");
        return res.status(400).render("account/register", {
            title: "Registration",
            nav,
            flashMessage: req.flash("notice") 
        });
    }

    try {
        const regResult = await accountModel.registerAccount(
            account_firstname,
            account_lastname,
            account_email,
            account_password
        );

        if (regResult && regResult.rows && regResult.rows[0]) {
            req.flash(
                "notice",
                `Congratulations, you're registered ${account_firstname}. Please log in.`
            );
            res.status(201).render("account/login", {
                title: "Login",
                nav,
                flashMessage: req.flash("notice") 
            });
        } else {
            req.flash("notice", "Sorry, the registration failed.");
            res.status(501).render("account/register", {
                title: "Registration",
                nav,
                flashMessage: req.flash("notice") 
            });
        }
    } catch (error) {
        console.error("Error during registration:", error);
        req.flash("notice", "An error occurred. Please try again later.");
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            flashMessage: req.flash("notice") 
        });
    }
}

module.exports = {
    buildLogin,
    buildRegister,
    loginAccount,
    registerAccount
};
