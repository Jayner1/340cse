const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


// Function to handle image paths
const handleImagePath = (imagePath) => {
  // If the image path is already absolute (starts with /images/vehicles/), return as is
  if (imagePath && imagePath.startsWith('/images/vehicles/')) {
    return imagePath;
  }
  // If the image path is a relative path (not starting with /images), add the prefix
  if (imagePath && !imagePath.startsWith('/images')) {
    return '/images/vehicles/' + imagePath;
  }
  // If the path already starts with /images, just return it as is (e.g., /images/survan.jpg)
  return imagePath;
}

Util.buildClassificationGrid = async function(data){
  let grid;
  if(data.length > 0){
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => { 
      // Handle image path
      let imagePath = handleImagePath(vehicle.inv_thumbnail);
      
      grid += '<li>';
      grid +=  '<a href="../../inv/detail/' + vehicle.inv_id + 
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
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
}

Util.formatVehicleDetails = function(vehicle) {
  const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.inv_price);
  const mileage = new Intl.NumberFormat('en-US').format(vehicle.inv_miles);

  // Handle image path
  let imagePath = handleImagePath(vehicle.inv_image);

  return `
    <div class="vehicle-details">
      <div class="vehicle-image">
        <img src="${imagePath}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-content">
        <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
        <p><strong>Year:</strong> ${vehicle.inv_year}</p>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Mileage:</strong> ${mileage} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </div>
  `;
}



module.exports = Util