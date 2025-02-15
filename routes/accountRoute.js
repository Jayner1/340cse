const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const regValidate = require('../utilities/account-validation');
const accountController = require('../controllers/accountController');
const { validationResult } = require("express-validator");


router.get('/my-account', async (req, res, next) => {
    try {
        await accountController.getMyAccount(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/login', async (req, res, next) => {
    try {
        await accountController.buildLogin(req, res, next);
    } catch (error) {
        next(error);
    }
});

// router.post('/login', async (req, res, next) => {
//     try {
//         await accountController.loginAccount(req, res);
//     } catch (error) {
//         next(error);
//     }
// });

// Temporary login route for testing validations
router.post("/login", (req, res) => {
    res.status(200).send('login process');
});


router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.post(
    "/register",
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

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

module.exports = router;
