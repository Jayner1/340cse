const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const pool = require("../database/index");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accountController = {};

/* ****************************************
 *  Deliver Login View
 * **************************************** */
accountController.buildLogin = async function (req, res, next) {
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
};

/* ****************************************
 *  Deliver Register View
 * **************************************** */
accountController.buildRegister = async function (req, res, next) {
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
};

/* ****************************************
 *  Login Account
 * **************************************** */
accountController.loginAccount = async function (req, res) {
    let nav = await utilities.getNav();
    const { account_email, account_password } = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email);
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
      return;
    }
    try {
      if (await bcrypt.compare(account_password, accountData.account_password)) {
        delete accountData.account_password;
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
        const cookieOptions = {
          httpOnly: true,
          maxAge: 3600 * 1000,
          secure: process.env.NODE_ENV !== 'development'
        };
        res.cookie("jwt", accessToken, cookieOptions);
        return res.redirect("/account/management");
      } else {
        req.flash("notice", "Please check your credentials and try again.");
        res.status(400).render("account/login", {
          title: "Login",
          nav,
          errors: null,
          account_email,
        });
      }
    } catch (error) {
      throw new Error('Access Forbidden');
    }
};

/* ****************************************
 *  Process Registration
 * **************************************** */
accountController.registerAccount = async function (req, res) {
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
};

/* ****************************************
 *  Show Account Management View
 * **************************************** */
accountController.showAccountManagement = async function (req, res, next) {
    try {
        let nav = await utilities.getNav();
        const account_firstname = res.locals.account_firstname || 'User';
        const account_email = req.user?.account_email || '';
        const account_id = req.user?.account_id;
        const account_type = req.user?.account_type;

        res.render("account/management", {
            title: "Account Management",
            nav,
            flashMessage: req.flash("notice")[0] || "",
            account_firstname,
            account_email,
            account_id,
            account_type
        });
    } catch (error) {
        next(error);
    }
};

/* ****************************************
 *  Build Update Account View
 * **************************************** */
accountController.buildUpdateAccount = async function (req, res, next) {
    try {
        const account_id = parseInt(req.params.account_id);
        const loggedInUserId = req.user.account_id;

        if (account_id !== loggedInUserId) {
            req.flash("notice", "You can only update your own account.");
            return res.redirect("/account/management");
        }

        let nav = await utilities.getNav();
        const accountData = await accountModel.getAccountById(account_id);
        if (!accountData) {
            req.flash("notice", "Account not found.");
            return res.redirect("/account/management");
        }

        res.render("account/update", {
            title: "Update Account",
            nav,
            flashMessage: req.flash("notice")[0] || "",
            errors: [],
            account_id: accountData.account_id,
            account_firstname: accountData.account_firstname,
            account_lastname: accountData.account_lastname,
            account_email: accountData.account_email
        });
    } catch (error) {
        next(error);
    }
};

/* ****************************************
 *  Update Account
 * **************************************** */
accountController.updateAccount = async function (req, res, next) {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    try {
        const updateResult = await accountModel.updateAccount(
            parseInt(account_id),
            account_firstname,
            account_lastname,
            account_email
        );
        if (updateResult) {
            const accountData = await accountModel.getAccountById(parseInt(account_id));
            delete accountData.account_password;
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
            res.cookie("jwt", accessToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV !== 'development', 
                maxAge: 3600 * 1000 
            });
            req.flash("notice", "Account updated successfully.");
            return res.redirect("/account/management");
        } else {
            req.flash("notice", "Account update failed.");
            return res.redirect("/account/management");
        }
    } catch (error) {
        console.error("updateAccount error:", error);
        req.flash("notice", "An error occurred while updating the account.");
        let nav = await utilities.getNav();
        res.status(500).render("account/update", {
            title: "Update Account",
            nav,
            flashMessage: req.flash("notice")[0] || "",
            errors: [],
            account_id,
            account_firstname,
            account_lastname,
            account_email
        });
    }
};

/* ****************************************
 *  Change Password
 * **************************************** */
accountController.changePassword = async function (req, res, next) {
    const { account_id, account_password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(account_password, 10);
        const updateResult = await accountModel.updatePassword(parseInt(account_id), hashedPassword);
        if (updateResult) {
            req.flash("notice", "Password changed successfully.");
            return res.redirect("/account/management");
        } else {
            req.flash("notice", "Password change failed.");
            return res.redirect("/account/management");
        }
    } catch (error) {
        console.error("changePassword error:", error);
        req.flash("notice", "An error occurred while changing the password.");
        let nav = await utilities.getNav();
        const accountData = await accountModel.getAccountById(parseInt(account_id));
        res.status(500).render("account/update", {
            title: "Update Account",
            nav,
            flashMessage: req.flash("notice")[0] || "",
            errors: [],
            account_id,
            account_firstname: accountData.account_firstname,
            account_lastname: accountData.account_lastname,
            account_email: accountData.account_email
        });
    }
};

/* ****************************************
 *  Logout Account
 * **************************************** */
accountController.logoutAccount = async function (req, res, next) {
    try {
        res.clearCookie('jwt', { 
            httpOnly: true, 
            secure: process.env.NODE_ENV !== 'development' 
        });
        
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Session destruction error:", err);
                    throw new Error("Logout failed");
                }
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error("Logout error:", error);
        req.flash("notice", "An error occurred during logout.");
        next(error);
    }
};

accountController.getMyAccount = async function (req, res, next) {
    try {
        let nav = await utilities.getNav();
        res.render("account/my-account", {
            title: "My Account",
            nav,
            flashMessage: req.flash("notice")[0] || ""
        });
    } catch (error) {
        next(error);
    }
};

module.exports = accountController;