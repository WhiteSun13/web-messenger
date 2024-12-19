const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  updateUserProfile,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// can be written separately "router.route("/").get(allUsers);"
router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);
router.route("/updateProfile").put(protect, updateUserProfile);

module.exports = router;
