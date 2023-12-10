const express = require("express");
const router = express.Router();
const {
  Login,
  Reg,
  updatePassword,
  resetPassword,
  update,
  profile,
  getAllUsers,
  RegComplete,
  userInfo,
} = require("./controller/auth");
const authMiddleware = require("./middleware/auth");

// router.post("/reg/cmplt", RegComplete);
router.post("/reg", Reg);
router.post("/pasrst", authMiddleware, updatePassword);
router.post("/frcrst", resetPassword);
router.post("/updt/:username", update);
router.post("/profile", authMiddleware, profile);
// router.post("/userInfo", authMiddleware, userInfo);
router.get("/src/al", getAllUsers);
router.post("/login", Login);

module.exports = router;
