const Order = require("../models/Order");
const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { checkPermissions } = require("../utils");
const Product = require("../models/Product");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomAPIError.BadRequestError("No cart item provide");
  }

  if (!tax || !shippingFee) {
    throw new CustomAPIError.BadRequestError(
      "Please provide tax and shipping fee "
    );
  }
  let orderItems = [];
  let subtotal = 0;
  for (let item of cartItems) {
    const dbproduct = await Product.findOne({ _id: item.product });

    if (!dbproduct) {
      throw new CustomAPIError.BadRequestError(
        `No product with id ${cartItems.product}`
      );
    }
    const { _id, name, price, image } = dbproduct;
    const singleProduct = {
      name: name,
      price: price,
      image: image,
      product: _id,
      amount: item.amount,
    };

    orderItems = [...orderItems, singleProduct];
    subtotal += item.amount * price;
  }

  total = tax + shippingFee + subtotal;
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    total,
    subtotal,
    tax,
    shippingFee,
    user: req.user.userId,
    orderItems,
    clientSecret: paymentIntent.client_secret,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrder = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomAPIError.BadRequestError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrder = async (req, res) => {
  const users = await Order.findOne({ user: req.user.userId });

  res.status(StatusCodes.OK).json({ users: users.user, count: users.length });
};
const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomAPIError.NotFoundError(`No order with id :${orderId}`);
  }
  checkPermissions(req.user, order.user);
  order.paymentIntent = paymentIntentId;
  order.status = "paid";
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  createOrder,
  getAllOrder,
  getSingleOrder,
  getCurrentUserOrder,
  updateOrder,
};
