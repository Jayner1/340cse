const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const regValidate = require('../utilities/account-validation');
const accountController = require('../controllers/accountController');

// Route to view My Account page
router.get('/my-account', async (req, res, next) => {
    try {
        await accountController.getMyAccount(req, res);
    } catch (error) {
        next(error);
    }
});

// Route to display login page
router.get('/login', async (req, res, next) => {
    try {
        await accountController.buildLogin(req, res, next);
    } catch (error) {
        next(error);
    }
});

// Route to handle login post request
router.post('/login', async (req, res, next) => {
    try {
        await accountController.loginAccount(req, res);
    } catch (error) {
        next(error);
    }
});

// Route to display register page
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to handle registration post request with validation
router.post(
    "/register",
    regValidate.registrationRules(),  // Validation middleware
    regValidate.checkRegData,  // Middleware to check validation results
    async (req, res, next) => {
        const errors = validationResult(req);  // Use validationResult instead of validationErrors()

        if (!errors.isEmpty()) {
            // If validation errors exist, flash the errors and redirect back to the register page
            req.flash('errors', errors.array());
            return res.redirect('/account/register');
        }

        // If no errors, proceed to the controller
        next();
    },
    utilities.handleErrors(accountController.registerAccount)  // Call the registerAccount controller
);

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

module.exports = router;
