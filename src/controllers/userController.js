const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors");
const User = require("../models/User");
const {
  createTokenUser,
  attachCookieToResponse,
  checkPermissions,
} = require("../utils");
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};
const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomAPIError.NotFoundError(`No user with : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};
const updateUser = async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    throw new CustomAPIError.BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;
  await user.save();

  const tokenUser = createTokenUser(user);

  attachCookieToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomAPIError.BadRequestError("Please provide both values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  const decodePasswordCorrect = await user.compasePassword(oldPassword);
  if (!decodePasswordCorrect) {
    throw new CustomAPIError.UnauthenticatedError("Invalid Credentials ");
  }
  user.password = newPassword;

  await user.save();

  res.status(StatusCodes.OK).json("Update password success...");
};
module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
