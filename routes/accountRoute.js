const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');

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

router.post('/login', async (req, res, next) => {
    try {
        await accountController.loginAccount(req, res);
    } catch (error) {
        next(error);
    }
});

router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.post('/register', utilities.handleErrors(accountController.registerAccount));

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

module.exports = router;
