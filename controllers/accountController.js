const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const pool = require("../database/index");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 *  Deliver Login View
 * **************************************** */
async function buildLogin(req, res, next) {
    try {
        let nav = await utilities.getNav();
        const flashMessage = req.flash("notice")[0] || ""; 
        res.render("account/login", {
            title: "Login",
            nav,
            flashMessage,
        });
    } catch (error) {
        next(error);
    }
}

/* ****************************************
 *  Deliver Register View
 * **************************************** */
async function buildRegister(req, res, next) {
    try {
        let nav = await utilities.getNav(); 
        const flashMessages = req.flash('notice'); 
        const flashMessage = flashMessages.length > 0 ? flashMessages[0] : ''; 

        const errors = req.flash('errors') || [];

        const { account_firstname = '', account_lastname = '', account_email = '' } = req.body;

        res.render("account/register", {
            title: "Register",
            nav,
            flashMessage,  
            errors,
            account_firstname, 
            account_lastname,
            account_email
        });
    } catch (error) {
        next(error);
    }
}


/* ****************************************
 *  Login Account
 * **************************************** */
async function loginAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
      return
    }
    try {
      if (await bcrypt.compare(account_password, accountData.account_password)) {
        delete accountData.account_password
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
        if(process.env.NODE_ENV === 'development') {
          res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        } else {
          res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        }
        return res.redirect("/account/")
      }
      else {
        req.flash("message notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
          title: "Login",
          nav,
          errors: null,
          account_email,
        })
      }
    } catch (error) {
      throw new Error('Access Forbidden')
    }
  }

/* ****************************************
 *  Process Registration
 * **************************************** */
/* ****************************************
 *  Process Registration
 * **************************************** */
async function registerAccount(req, res) {
    const { account_firstname, account_lastname, account_email, account_password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).render("account/register", {
            title: "Registration",
            nav: await utilities.getNav(),
            flashMessage: req.flash("notice").length > 0 ? req.flash("notice")[0] : '', 
            errors: errors.array(),
            account_firstname,
            account_lastname,
            account_email
        });
    }

    if (!account_firstname || !account_lastname || !account_email || !account_password) {
        req.flash("notice", "All fields are required.");
        return res.status(400).render("account/register", {
            title: "Registration",
            nav: await utilities.getNav(),
            flashMessage: req.flash("notice").length > 0 ? req.flash("notice")[0] : '', 
            errors: [],
            account_firstname,
            account_lastname,
            account_email
        });
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(account_password, 10); 
    } catch (error) {
        console.error("Error hashing password:", error);
        req.flash("notice", "Sorry, there was an error processing the registration.");
        return res.status(500).render("account/register", {
            title: "Registration",
            nav: await utilities.getNav(),
            flashMessage: req.flash("notice").length > 0 ? req.flash("notice")[0] : '', 
            errors: [],
            account_firstname,
            account_lastname,
            account_email
        });
    }

    try {
        const regResult = await accountModel.registerAccount(
            account_firstname,
            account_lastname,
            account_email,
            hashedPassword
        );

        if (regResult && regResult.account_id) {
            req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
            return res.redirect("/account/login");
        } else {
            req.flash("notice", "Sorry, the registration failed.");
            return res.status(500).render("account/register", {
                title: "Registration",
                nav: await utilities.getNav(),
                flashMessage: req.flash("notice").length > 0 ? req.flash("notice")[0] : '', 
                errors: [],
                account_firstname,
                account_lastname,
                account_email
            });
        }
    } catch (error) {
        console.error("Error during registration:", error);
        req.flash("notice", "An error occurred. Please try again later.");
        return res.status(500).render("account/register", {
            title: "Registration",
            nav: await utilities.getNav(),
            flashMessage: req.flash("notice").length > 0 ? req.flash("notice")[0] : '', 
            errors: [],
            account_firstname,
            account_lastname,
            account_email
        });
    }
}

async function showAccountManagement(req, res, next) {
    try {
        let nav = await utilities.getNav();
        
        // Verify JWT token from cookie
        const token = req.cookies.jwt;
        if (!token) {
            req.flash("notice", "Please log in to access your account.");
            return res.redirect("/account/login");
        }

        // Decode token to get user info
        let accountData;
        try {
            accountData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            req.flash("notice", "Session expired. Please log in again.");
            res.clearCookie("jwt");
            return res.redirect("/account/login");
        }

        res.render("account/management", {
            title: "Account Management",
            nav,
            flashMessage: req.flash("notice")[0] || "",
            account_firstname: accountData.account_firstname,
            account_email: accountData.account_email
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    buildLogin,
    buildRegister,
    loginAccount,
    registerAccount,
    showAccountManagement
};
