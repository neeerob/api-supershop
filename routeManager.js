const product = require('./routes/productRoutes');
const stock = require('./routes/stockRoutes');
const sales = require('./routes/salesRoutes');
const receipt = require('./routes/receiptRoutes');

module.exports = function () {
    app.use("/product", product);
    app.use("/stock", stock);
    app.use("/sales", sales);
    app.use("/receipt", receipt);
};
