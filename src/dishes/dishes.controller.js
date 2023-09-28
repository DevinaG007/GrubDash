const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//handles GET HTTP method for all dishes
function list(req, res) {
  res.json({ data: dishes });
}

//middleware function to check if dish Id exists
//stores found dish in res.locals to pass to handler functions
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  }
  next({ status: 404, message: `Dish does not exist: ${dishId}.` });
}

////handles GET HTTP method for a single dish
function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

//middleware function checks if request body has necessary properties
function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Dish must include a ${propertyName}` });
  };
}

//middleware function validates if price property is valid
function pricePropertyIsValid(req, res, next) {
  const {
    data: { price },
  } = req.body;
  if (Number.isInteger(price) && price > 0) {
    return next();
  }
  next({
    status: 400,
    message: `Dish must have a price that is an integer greater than 0`,
  });
}

//handles POST HTTP method
function create(req, res) {
  const newId = nextId();
  console.log(newId);
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: newId,
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

//handles PUT HTTP method
function update(req, res, next) {
  const { dishId } = req.params;
  const dish = res.locals.dish;
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  if (!id || id === dishId) {
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.json({ data: dish });
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    pricePropertyIsValid,
    create,
  ],
  update: [
    dishExists,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    pricePropertyIsValid,
    update,
  ],
};
// TODO: Implement the /dishes handlers needed to make the tests pass
