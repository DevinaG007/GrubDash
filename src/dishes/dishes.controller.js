const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function list(req, res, next) {
  res.json({ data: dishes });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  }
  next({ status: 404, message: `Dish does not exist: ${dishId}.` });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Dish must include a ${propertyName}` });
  };
}

function namePropertyIsValid(req, res, next) {
  const {
    data: { name },
  } = req.body;
  if (name) {
    return next();
  }
  next({ status: 400, message: `Dish must include a name` });
}

function descriptionPropertyIsValid(req, res, next) {
  const {
    data: { description },
  } = req.body;
  if (description) {
    return next();
  }
  next({ status: 400, message: `Dish must include a description` });
}

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

function imageUrlPropertyIsValid(req, res, next) {
  const {
    data: { image_url },
  } = req.body;
  if (image_url) {
    return next();
  }
  next({ status: 400, message: `Dish must include a image_url` });
}
function create(req, res, next) {
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
    namePropertyIsValid,
    descriptionPropertyIsValid,
    pricePropertyIsValid,
    imageUrlPropertyIsValid,
    create,
  ],
  update: [
    dishExists,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    namePropertyIsValid,
    descriptionPropertyIsValid,
    pricePropertyIsValid,
    imageUrlPropertyIsValid,
    update,
  ],
};
// TODO: Implement the /dishes handlers needed to make the tests pass
