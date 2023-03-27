const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors");
const { attachCookieToResponse, createTokenUser } = require("../utils");
const register = async (req, res) => {
  const { email, name, password } = req.body;
  const checkEmail = await User.findOne({ email });

  if (checkEmail) {
    throw new CustomAPIError.BadRequestError("Email already exists");
  }

  // Nếu là người đầu tiên đăng ký thì auto == admin
  const isFistAccount = (await User.countDocuments({})) === 0;
  const role = isFistAccount ? "admin" : "user";

  const user = await User.create({ name, email, password, role });

  const tokenUser = createTokenUser(user);

  // sign jwt and response cookie
  attachCookieToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomAPIError.BadRequestError(
      "Please provide email and password"
    );
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomAPIError.UnauthenticatedError("Invalid Credentials");
  }
  const decodePassword = await user.compasePassword(password);
  if (!decodePassword) {
    throw new CustomAPIError.UnauthenticatedError("Invalid Credentials");
  }
  const tokenUser = createTokenUser(user);

  attachCookieToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json("User logged out!!!!");
};
module.exports = { register, login, logout };
