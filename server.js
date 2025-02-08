/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require('./utilities/index');

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") 

/* ***********************
 * Routes
 *************************/
app.use(static)
// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", inventoryRoute)
// Server crash
app.get("/trigger-500-error", (req, res, next) => {
  const undefinedValue = undefined;
  undefinedValue.ExistentProperty;
});
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Oops! Something went wrong.'})
})

/* ***********************
 * Express Error Handler
 * Place after all the other middlweware
 * Unit 3, Basic Error Handling Activity
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
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})