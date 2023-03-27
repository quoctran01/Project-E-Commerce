const express = require("express");
const {
  getAllProduct,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authenticateuser");
const { getSingleProductReview } = require("../controllers/reviewController");
const router = express.Router();

router
  .route("/")
  .get(getAllProduct)
  .post(authenticateUser, authorizePermissions("admin"), createProduct);

router
  .route("/uploadsImage")
  .post(authenticateUser, authorizePermissions("admin"), uploadImage);
router
  .route("/:id")
  .get(getSingleProduct)
  .patch(authenticateUser, authorizePermissions("admin"), updateProduct)
  .delete(authenticateUser, authorizePermissions("admin"), deleteProduct);

router.route("/:id/reviews").get(getSingleProductReview);

module.exports = router;
