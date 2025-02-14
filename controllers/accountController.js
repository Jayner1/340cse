const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const pool = require("../database/index");
const { check, validationResult } = require("express-validator");

/* ****************************************
 *  Deliver Login View
 * **************************************** */
async function buildLogin(req, res, next) {
    try {
        let nav = await utilities.getNav();
        const flashMessage = req.flash("notice")[0] || ""; // Ensure flash message is retrieved properly
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
        const flashMessage = flashMessages.length > 0 ? flashMessages[0] : ''; // Ensure it's a string

        // Ensure errors are passed correctly, default to empty array
        const errors = req.flash('errors') || [];

        // Get form values for stickiness (if any values were submitted previously)
        const { account_firstname = '', account_lastname = '', account_email = '' } = req.body;

        res.render("account/register", {
            title: "Register",
            nav,
            flashMessage,  // Explicitly passing the flash message
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
            req.flash("notice", `Welcome back, ${user.account_firstname}!`);
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

    try {
        const regResult = await accountModel.registerAccount(
            account_firstname,
            account_lastname,
            account_email,
            account_password
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


module.exports = {
    buildLogin,
    buildRegister,
    loginAccount,
    registerAccount,
};
