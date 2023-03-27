const CustomAPIError = require("../errors");
const { isTokenValid } = require("../utils/jwt");
const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomAPIError.UnauthenticatedError("Authentication invalid");
  }
  try {
    const { name, userId, role } = isTokenValid({ token });
    /*req.user = {
      name: payload.name,
      userId: payload.userId,
      role: payload.role,
    };*/
    req.user = { name, userId, role };
    next();
  } catch (error) {}
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomAPIError.Unauthorized(
        "Unauthorized to access this router"
      );
    }
    next();
  };
};
module.exports = { authenticateUser, authorizePermissions };
