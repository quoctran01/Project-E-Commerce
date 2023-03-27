const express = require("express");
const router = express.Router();

const {
  createReview,
  getAllReview,
  getSingleReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const { authenticateUser } = require("../middleware/authenticateuser");

router.route("/").post(authenticateUser, createReview).get(getAllReview);
router
  .route("/:id")
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);
module.exports = router;
