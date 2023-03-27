const Product = require("../models/Product");
const Review = require("../models/Review");
const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors");
const { checkPermissions } = require("../utils");

const createReview = async (req, res) => {
  const productId = req.body.product;
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new CustomAPIError.NotFoundError(`No product with id : ${productId}`);
  }
  const alreadSubmited = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadSubmited) {
    throw new CustomAPIError.BadRequestError(
      "Already submited review for this product"
    );
  }
  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};
const getAllReview = async (req, res) => {
  const review = await Review.find({}).populate({
    path: "product",
    select: "name price",
  });
  res.status(StatusCodes.OK).json({ review });
};
const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!reviewId) {
    throw new CustomAPIError.NotFoundError(`No review with id ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomAPIError.NotFoundError(`No review with id : ${id}`);
  }
  checkPermissions(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();

  res.status(StatusCodes.OK).json({ review });
};
const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomAPIError.NotFoundError(`No review with id : ${id}`);
  }

  checkPermissions(req.user, review.user);

  await review.deleteOne();
  res.status(StatusCodes.OK).json("'Success! Review removed'");
};
const getSingleProductReview = async (req, res) => {
  const { id: productId } = req.params;
  const review = await Review.find({ product: productId, rating: "1" });
  res.status(StatusCodes.OK).json({ review, count: review.length });
};

module.exports = {
  createReview,
  getAllReview,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReview,
};
