const CustomAPIError = require("../errors");

const checkPermissions = (requestUser, resourceUserId) => {
  /*console.log(requestUser);
  console.log(resourceUserId);
  console.log(typeof requestUser);
  console.log(typeof resourceUserId);*/
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;

  throw new CustomAPIError.Unauthorized("Not authorized to access this router");
};

module.exports = checkPermissions;
