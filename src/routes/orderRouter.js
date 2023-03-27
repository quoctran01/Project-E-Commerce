const express = require("express");

const router = express.Router();

const {
  createOrder,
  getAllOrder,
  getSingleOrder,
  getCurrentUserOrder,
  updateOrder,
} = require("../controllers/orderController");

const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authenticateuser");

router
  .route("/")
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions("admin"), getAllOrder);

router.route("/showAllMyOrder").get(authenticateUser, getCurrentUserOrder);
router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);
module.exports = router;
