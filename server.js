/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require('./utilities/index');
const session = require("express-session");
const pool = require("./database/");
const accountRoute = require("./routes/accountRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(cookieParser());

// Debug all cookies
app.use((req, res, next) => {
  console.log("All cookies:", req.cookies);
  next();
});

// JWT Middleware
app.use(async (req, res, next) => {
  const token = req.cookies.jwt;
  console.log("JWT cookie:", token);
  if (token) {
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log("Decoded JWT:", decoded);
      req.user = decoded;
      res.locals.loggedin = true;
      res.locals.account_firstname = decoded.account_firstname || "User";
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      res.locals.loggedin = false;
    }
  } else {
    res.locals.loggedin = false;
  }
  console.log("Logged in status:", res.locals.loggedin);
  next();
});

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(express.static('public'));
app.use(static); 

// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inv", inventoryRoute);

// Account routes
app.use("/account", accountRoute);

// Server crash (for testing)
app.get("/trigger-500-error", (req, res, next) => {
  const undefinedValue = undefined;
  undefinedValue.ExistentProperty;
});

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Oops! Something went wrong.' });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware and routes
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  const status = err.status || 500;
  const message =
    status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";
  res.status(status).render("errors/error", {
    title: `${status} Error`,
    message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});