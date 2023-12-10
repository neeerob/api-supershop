const product = require("./routes/productRoutes");
const stock = require("./routes/stockRoutes");
const sales = require("./routes/salesRoutes");
const receipt = require("./routes/receiptRoutes");
const auth = require("./AccessManagement/index");

module.exports = function () {
  app.use("/product", product);
  app.use("/stock", stock);
  app.use("/sales", sales);
  app.use("/receipt", receipt);
  app.use("/auth", auth);
  // app.post("/test", async (req, res) => {
  //   console.log(req.body);
  //   res.send("ok");
  // });
  // app.post("/welcome", authMiddleware, async (req, res) => {
  //   return res.status(200).send({ message: "Welcome", data: req.user });
  // });
};
