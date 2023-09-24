const mongoose = require("mongoose");

const dailyProductSalesSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  products: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      productName: {
        type: String,
        required: true,
      },
      totalCostPrice: {
        type: Number,
        required: true,
      },
      totalLoss: {
        type: Number,
        required: true,
      },
      totalProfit: {
        type: Number,
        required: true,
      },
      totalRevenue: {
        type: Number,
        required: true,
      },
      totalUnitsSold: {
        type: Number,
        required: true,
      },
    },
  ],
});

const DailyProductSale = mongoose.model(
  "DailyProductSale",
  dailyProductSalesSchema
);

module.exports = DailyProductSale;
