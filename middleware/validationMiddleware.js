const validateClassificationName = (req, res, next) => {
    const { classificationName } = req.body;
    const trimmedName = classificationName ? classificationName.trim() : "";
  
    if (!trimmedName) {
      req.flash("error", "Classification name is required.");
      req.flash("classificationName", trimmedName);
      return res.redirect("/inv/add-classification");
    }
  
    if (!/^[a-zA-Z0-9 _-]+$/.test(trimmedName)) {
      req.flash("error", "Classification name can only contain letters, numbers, spaces, underscores, or dashes.");
      req.flash("classificationName", trimmedName);
      return res.redirect("/inv/add-classification");
    }
  
    req.body.classificationName = trimmedName;
    next();
};
  
const validateInventoryData = (req, res, next) => {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_color,
      inv_price,
      inv_miles,
      classification_id,
    } = req.body;
  
    const trimmedMake = inv_make ? inv_make.trim() : "";
    const trimmedModel = inv_model ? inv_model.trim() : "";
    const trimmedYear = inv_year ? inv_year.trim() : "";
    const trimmedColor = inv_color ? inv_color.trim() : "";
    const trimmedPrice = inv_price ? inv_price.trim() : "";
    const trimmedMiles = inv_miles ? inv_miles.trim() : "";
    const trimmedClassificationId = classification_id ? classification_id.trim() : "";
  
    if (
      !trimmedMake ||
      !trimmedModel ||
      !trimmedYear ||
      !trimmedColor ||
      !trimmedPrice ||
      !trimmedMiles ||
      !trimmedClassificationId
    ) {
      req.flash("error", "All fields are required.");
      req.flash("inv_make", trimmedMake);
      req.flash("inv_model", trimmedModel);
      req.flash("inv_year", trimmedYear);
      req.flash("inv_color", trimmedColor);
      req.flash("inv_price", trimmedPrice);
      req.flash("inv_miles", trimmedMiles);
      req.flash("classification_id", trimmedClassificationId);
      return res.redirect("/inv/add-inventory");
    }
  
    if (!/^[a-zA-Z0-9 _-]+$/.test(trimmedMake)) {
      req.flash("error", "Make can only contain letters, numbers, spaces, underscores, or dashes.");
      req.flash("inv_make", trimmedMake);
      req.flash("inv_model", trimmedModel);
      req.flash("inv_year", trimmedYear);
      req.flash("inv_color", trimmedColor);
      req.flash("inv_price", trimmedPrice);
      req.flash("inv_miles", trimmedMiles);
      req.flash("classification_id", trimmedClassificationId);
      return res.redirect("/inv/add-inventory");
    }
  
    if (!/^[a-zA-Z0-9 _-]+$/.test(trimmedModel)) {
      req.flash("error", "Model can only contain letters, numbers, spaces, underscores, or dashes.");
      req.flash("inv_make", trimmedMake);
      req.flash("inv_model", trimmedModel);
      req.flash("inv_year", trimmedYear);
      req.flash("inv_color", trimmedColor);
      req.flash("inv_price", trimmedPrice);
      req.flash("inv_miles", trimmedMiles);
      req.flash("classification_id", trimmedClassificationId);
      return res.redirect("/inv/add-inventory");
    }
  
    if (!/^\d{4}$/.test(trimmedYear) || Number(trimmedYear) < 1900 || Number(trimmedYear) > new Date().getFullYear() + 1) {
      req.flash("error", "Year must be a valid 4-digit number between 1900 and next year.");
      req.flash("inv_make", trimmedMake);
      req.flash("inv_model", trimmedModel);
      req.flash("inv_year", trimmedYear);
      req.flash("inv_color", trimmedColor);
      req.flash("inv_price", trimmedPrice);
      req.flash("inv_miles", trimmedMiles);
      req.flash("classification_id", trimmedClassificationId);
      return res.redirect("/inv/add-inventory");
    }
  
    if (!/^[a-zA-Z _-]+$/.test(trimmedColor)) {
      req.flash("error", "Color can only contain letters, spaces, underscores, or dashes.");
      req.flash("inv_make", trimmedMake);
      req.flash("inv_model", trimmedModel);
      req.flash("inv_year", trimmedYear);
      req.flash("inv_color", trimmedColor);
      req.flash("inv_price", trimmedPrice);
      req.flash("inv_miles", trimmedMiles);
      req.flash("classification_id", trimmedClassificationId);
      return res.redirect("/inv/add-inventory");
    }
  
    if (isNaN(Number(trimmedPrice)) || Number(trimmedPrice) < 0) {
      req.flash("error", "Price must be a positive number.");
      req.flash("inv_make", trimmedMake);
      req.flash("inv_model", trimmedModel);
      req.flash("inv_year", trimmedYear);
      req.flash("inv_color", trimmedColor);
      req.flash("inv_price", trimmedPrice);
      req.flash("inv_miles", trimmedMiles);
      req.flash("classification_id", trimmedClassificationId);
      return res.redirect("/inv/add-inventory");
    }
  
    if (isNaN(Number(trimmedMiles)) || Number(trimmedMiles) < 0) {
      req.flash("error", "Mileage must be a positive number.");
      req.flash("inv_make", trimmedMake);
      req.flash("inv_model", trimmedModel);
      req.flash("inv_year", trimmedYear);
      req.flash("inv_color", trimmedColor);
      req.flash("inv_price", trimmedPrice);
      req.flash("inv_miles", trimmedMiles);
      req.flash("classification_id", trimmedClassificationId);
      return res.redirect("/inv/add-inventory");
    }
  
    if (isNaN(Number(trimmedClassificationId)) || Number(trimmedClassificationId) <= 0) {
      req.flash("error", "Please select a valid classification.");
      req.flash("inv_make", trimmedMake);
      req.flash("inv_model", trimmedModel);
      req.flash("inv_year", trimmedYear);
      req.flash("inv_color", trimmedColor);
      req.flash("inv_price", trimmedPrice);
      req.flash("inv_miles", trimmedMiles);
      req.flash("classification_id", trimmedClassificationId);
      return res.redirect("/inv/add-inventory");
    }
  
    req.body.inv_make = trimmedMake;
    req.body.inv_model = trimmedModel;
    req.body.inv_year = trimmedYear;
    req.body.inv_color = trimmedColor;
    req.body.inv_price = trimmedPrice;
    req.body.inv_miles = trimmedMiles;
    req.body.classification_id = trimmedClassificationId;
  
    next();
};
  
module.exports = {
    validateClassificationName,
    validateInventoryData,
};