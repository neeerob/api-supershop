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
const universalMiddleware = require("./middleware/universal.middleware");
const addlwedPermission = {
  admin: [1, 2, 3, 4, 5],
  manager: [2, 3, 4, 5],
  sales: [3, 4, 5],
  cashier: [4, 5],
  customer: [5],
};

// router.post("/reg/cmplt", RegComplete);
router.post("/reg", Reg);
router.post("/pasrst", authMiddleware, updatePassword);
router.post("/frcrst", resetPassword);
router.post("/updt/:username", update);
router.post("/profile", authMiddleware, profile);
// router.post("/userInfo", authMiddleware, userInfo);
router.get("/src/al", authMiddleware, getAllUsers);
router.post("/login", Login);

router.get("/chk", authMiddleware, universalMiddleware([1]), (req, res) => {
  res.status(200).send({
    message: "your type is " + req.user.type + " and you are allowed!",
  });
});

module.exports = router;
