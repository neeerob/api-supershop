const mongoose = require("mongoose");

const monthlySalesSchema = new mongoose.Schema({
  date: {
    type: Date,
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
});

const MonthlySale = mongoose.model("MonthlySale", monthlySalesSchema);

module.exports = MonthlySale;
