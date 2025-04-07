const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const regValidate = require('../utilities/account-validation');
const accountController = require('../controllers/accountController');
const { validationResult } = require("express-validator");

// Default route for account management
router.get('/', 
    utilities.checkLogin,
    utilities.handleErrors(accountController.showAccountManagement)
);

// My Account route
router.get('/my-account', 
    utilities.checkLogin,
    utilities.handleErrors(accountController.getMyAccount)
);

// Login routes
router.get('/login', 
    utilities.handleErrors(accountController.buildLogin)
);

router.post('/login',
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.loginAccount)
);

// Registration routes
router.get('/register', 
    utilities.handleErrors(accountController.buildRegister)
);

router.post('/register',
    regValidate.registrationRules(),
    regValidate.checkRegData,
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('errors', errors.array());
            return res.redirect('/account/register');
        }
        next();
    },
    utilities.handleErrors(accountController.registerAccount)
);

// Account management route
router.get('/management', 
    utilities.checkLogin,
    utilities.handleErrors(accountController.showAccountManagement)
);

// Update account routes
router.get('/update/:account_id', 
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildUpdateAccount)
);

router.post('/update',
    utilities.checkLogin,
    regValidate.updateAccountRules(),
    regValidate.checkUpdateAccountData,
    utilities.handleErrors(accountController.updateAccount)
);

// Change password route
router.post('/change-password',
    utilities.checkLogin,
    regValidate.changePasswordRules(),
    regValidate.checkChangePasswordData,
    utilities.handleErrors(accountController.changePassword)
);

// Logout route
router.get('/logout',
    utilities.handleErrors(accountController.logoutAccount)
);

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

router.post('/favorite/add', utilities.checkLogin, utilities.handleErrors(accountController.addFavorite));
router.post('/favorite/remove', utilities.checkLogin, utilities.handleErrors(accountController.removeFavorite));

module.exports = router;