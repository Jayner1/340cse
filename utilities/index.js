const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Util = {};

/* ******************************
 * Check JWT Login Middleware
 * ****************************** */
Util.checkLogin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("notice", "Please log in to access your account.");
    return res.redirect("/account/login");
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; 
    res.locals.loggedin = true; 
    res.locals.account_firstname = decoded.account_firstname; 
    next();
  } catch (error) {
    req.flash("notice", "Session expired. Please log in again.");
    res.clearCookie("jwt");
    return res.redirect("/account/login");
  }
};

/* ******************************
 * Check JWT Token for Views
 * ****************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = true; 
        res.locals.account_firstname = accountData.account_firstname; 
        next();
      }
    );
  } else {
    res.locals.loggedin = false; 
    res.locals.account_firstname = null; 
    next();
  }
};

/* ******************************
 * Existing Utility Functions
 * ****************************** */
Util.getNav = async function () {
  try {
    const data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.forEach((row) => {
      list += "<li>";
      list +=
        '<a href="/inv/classification/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>";
      list += "</li>";
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("getNav error: " + error);
    return "<ul><li><a href='/' title='Home page'>Home</a></li></ul>";
  }
};

Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const handleImagePath = (imagePath) => {
  if (!imagePath) return "/images/vehicles/no-image.png";
  const basePath = '/images/vehicles/';
  const parts = imagePath.split('/').filter(part => part);
  const fileNameIndex = parts.lastIndexOf('vehicles') + 1;
  const fileName = parts.slice(fileNameIndex).join('/');
  return basePath + fileName;
};

Util.buildClassificationGrid = async function(data){
  if (!Array.isArray(data) || data.length === 0) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  let grid = '<ul id="inv-display">';
  data.forEach(vehicle => {
    let imagePath = handleImagePath(vehicle.inv_thumbnail);
    grid += '<li>';
    grid += '<a href="../../inv/detail/' + vehicle.inv_id +
            '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model +
            ' details"><img src="' + imagePath +
            '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model +
            ' on CSE Motors"></a>';
    grid += '<div class="namePrice">';
    grid += '<hr>';
    grid += '<h2>';
    grid += '<a href="../../inv/detail/' + vehicle.inv_id +
            '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model +
            ' details">' + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
    grid += '</h2>';
    grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
    grid += '</div>';
    grid += '</li>';
  });
  grid += '</ul>';
  return grid;
};

Util.formatVehicleDetails = function(vehicle) {
  if (!vehicle) return '<p class="notice">Vehicle details not available.</p>';
  const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.inv_price || 0);
  const miles = new Intl.NumberFormat('en-US').format(vehicle.inv_miles || 0);
  let imagePath = handleImagePath(vehicle.inv_image);

  return `
    <div class="vehicle-details">
      <div class="vehicle-image">
        <img src="${imagePath}" alt="${vehicle.inv_make || 'Unknown'} ${vehicle.inv_model || 'Model'}">
      </div>
      <div class="vehicle-content">
        <h1>${vehicle.inv_make || 'Unknown'} ${vehicle.inv_model || 'Model'}</h1>
        <p><strong>Year:</strong> ${vehicle.inv_year || 'N/A'}</p>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Miles:</strong> ${miles} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description || 'No description available'}</p>
      </div>
    </div>
  `;
};

Util.buildClassificationList = async function (classification_id = null) {
  try {
    let data = await invModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";
    data.forEach((row) => {
      classificationList += `<option value="${row.classification_id}"`;
      if (classification_id != null && row.classification_id == classification_id) {
        classificationList += " selected";
      }
      classificationList += `>${row.classification_name}</option>`;
    });
    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error("buildClassificationList error: " + error);
    return '<select name="classification_id" id="classificationList" required><option value="">No classifications available</option></select>';
  }
};

/* ******************************
 * Check Admin or Employee Access Middleware
 * ****************************** */
Util.checkAdminOrEmployee = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("notice", "Please log in with an Employee or Admin account to access this feature.");
    return res.redirect("/account/login");
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const allowedTypes = ["Employee", "Admin"];
    if (!allowedTypes.includes(decoded.account_type)) {
      req.flash("notice", "Access denied. Only Employee or Admin accounts can perform this action.");
      return res.redirect("/account/login");
    }
    req.user = decoded; 
    res.locals.loggedin = true; 
    res.locals.account_firstname = decoded.account_firstname;
    next();
  } catch (error) {
    req.flash("notice", "Session expired or invalid. Please log in again.");
    res.clearCookie("jwt");
    return res.redirect("/account/login");
  }
};

module.exports = Util;