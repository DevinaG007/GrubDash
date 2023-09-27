const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function list(req, res, next) {
  res.json({ data: orders });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  }
  next({ status: 404, message: `Order does not exist: ${orderId}` });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}
function deliverToIsValid(req, res, next){
    const {data: {deliverTo} = {}} = req.body;
    if (deliverTo){
        return next();
    }
    next({status: 400, message: `Order must include a deliverTo`})
}

function mobileNumberIsValid(req, res, next){
    const {data: {mobileNumber} = {}} = req.body;
    if (mobileNumber){
        return next();
    }
    next({status: 400, message: `Order must include a mobileNumber`})
}

function dishesIsValid(req, res, next){
    const {data: {dishes} = {}} = req.body;
    if (Array.isArray(dishes) && dishes.length > 0){
        dishes.forEach((dish, index) => {
            const quantity = dish.quantity;
            if (!quantity || quantity <= 0 || !Number.isInteger(quantity)){
                return next({status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`})
            } else if (index === dishes.length - 1){
                return next()
            }
        })
    }
    next({status: 400, message: `Order must include at least one dish`})
}
function hasBodyProperty(propertyName){
    return function(req, res, next){
        const {data = {}} = req.body;
        if (data[propertyName]){
            return next()
        }
        next({status: 400, message: `Order must include a ${propertyName}`})
    }
}

function create(req, res, next) {
  const newId = nextId();
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const newOrder = {
    id: newId,
    deliverTo,
    mobileNumber,
    status: "pending",
    dishes,
  };
  orders.push(newOrder)
  res.status(201).json({data: newOrder})
}

function update(req, res, next){
    const order = res.locals.order;
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body;
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;
    res.json({data: order})
}

// TODO: Implement the /orders handlers needed to make the tests pass
module.exports = {
  list,
  read: [orderExists, read],
  create: [hasBodyProperty("deliverTo"), 
  hasBodyProperty("mobileNumber"),
  hasBodyProperty("dishes"), 
  deliverToIsValid,
  mobileNumberIsValid,
  dishesIsValid, 
  create
], 
update: [
    orderExists,
    hasBodyProperty("deliverTo"), 
    hasBodyProperty("mobileNumber"),
    hasBodyProperty("dishes"), 
    hasBodyProperty("status"),
    deliverToIsValid,
    mobileNumberIsValid,
    dishesIsValid, 
    update  
]
};
