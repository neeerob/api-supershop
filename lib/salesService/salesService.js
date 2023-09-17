const Product = require("../../models/productModel");
const Stock = require("../../models/stocksModel");
const Sale = require("../../models/salesModel");
const statusModel = require("../../utils/statusMessages");

async function registerSales(data, discount) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    let productId = data.productId;
    let quantitySold = data.quantitySold;
    let salePrice = data.salePrice;
    if (discount == null) {
      discount = 0;
    } else {
      discount = parseInt(discount);
    }

    if (discount == null) {
      discount = 0;
    } else {
      discount = parseInt(discount);
    }
    const product = await Product.findById(productId);
    if (!product && product.isDeleted == false) {
      (output.status = statusModel.notFound.code),
        (output.message = statusModel.notFound.message),
        (output.error = true),
        (output.data = null);
    } else {
      const stock = await Stock.findOne({ product_id: productId });
      if (quantitySold < stock.stockQuantity) {
        stock.stockQuantity -= quantitySold;
        await stock.save();
        //sells
        const sale = new Sale({
          product_id: productId,
          quantitySold: quantitySold,
          salePrice: salePrice,
          costPrice: product.price,
          date: new Date(),
          discount: discount,
        });
        await sale.save();
        (output.status = statusModel.success.code),
          (output.message = statusModel.success.message),
          (output.error = false),
          (output.data = sale);
      } else {
        (output.status = statusModel.conflict.code),
          (output.message = statusModel.conflict.message),
          (output.error = true),
          (output.data = products);
      }
    }
    return output;
  } catch (error) {
    (output.status = statusModel.internalServerError.code),
      (output.message = statusModel.internalServerError.message),
      (output.error = true),
      (output.data = error);
    return output;
  }
}

async function searchByID(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    const product = await Sale.findById(data);
    if (product) {
      (output.status = statusModel.success.code),
        (output.message = statusModel.success.message),
        (output.error = false),
        (output.data = product);
    } else {
      (output.status = statusModel.notFound.code),
        (output.message = statusModel.notFound.message),
        (output.error = true),
        (output.data = null);
    }
    return output;
  } catch (error) {
    (output.status = statusModel.internalServerError.code),
      (output.message = statusModel.internalServerError.message),
      (output.error = true),
      (output.data = error);
    return output;
  }
}

async function monthlyReport() {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    const monthlySales = await Sale.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            product_id: "$product_id",
          },
          totalRevenue: {
            $sum: { $multiply: ["$quantitySold", "$salePrice"] },
          },
          totalUnitsSold: { $sum: "$quantitySold" },
          totalProfit: {
            $sum: {
              $multiply: [
                "$quantitySold",
                { $subtract: ["$salePrice", "$costPrice"] },
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          monthlySales: {
            $push: {
              product_id: "$_id.product_id",
              totalRevenue: "$totalRevenue",
              totalUnitsSold: "$totalUnitsSold",
              totalProfit: "$totalProfit",
            },
          },
          totalMonthlyRevenue: { $sum: "$totalRevenue" },
          totalMonthlyProfit: { $sum: "$totalProfit" },
        },
      },
    ]);
    (output.status = statusModel.success.code),
      (output.message = statusModel.success.message),
      (output.error = false),
      (output.data = monthlySales);
    return output;
  } catch (error) {
    (output.status = statusModel.internalServerError.code),
      (output.message = statusModel.internalServerError.message),
      (output.error = true),
      (output.data = error);
    return output;
  }
}

async function yearlyReport(req, res) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    const yearlySales = await Sale.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
          },
          totalRevenue: {
            $sum: { $multiply: ["$quantitySold", "$salePrice"] },
          },
          totalUnitsSold: { $sum: "$quantitySold" },
          totalCostOfGoodsSold: {
            $sum: { $multiply: ["$quantitySold", "$costPrice"] },
          },
        },
      },
    ]);

    yearlySales.forEach((year) => {
      year.LossOrProfit = year.totalRevenue - year.totalCostOfGoodsSold;
    });

    (output.status = statusModel.success.code),
      (output.message = statusModel.success.message),
      (output.error = false),
      (output.data = yearlySales);
    return output;
  } catch (error) {
    (output.status = statusModel.internalServerError.code),
      (output.message = statusModel.internalServerError.message),
      (output.error = true),
      (output.data = error);
    return output;
  }
}

async function reportByDate(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    const { productId, startDate, endDate } = data;
    if (!productId || !startDate || !endDate) {
      (output.status = statusModel.conflict.code),
        (output.message = "Missing paramitters"),
        (output.error = true),
        (output.data = null);
    }
    const product = await Product.findById(productId);
    if (!product) {
      (output.status = statusModel.notFound.code),
        (output.message = statusModel.notFound.message),
        (output.error = true),
        (output.data = null);
    }
    const filters = {};
    filters.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
    filters.product_id = productId;
    const sales = await Sale.find(filters);

    (output.status = statusModel.success.code),
      (output.message = statusModel.success.message),
      (output.error = false),
      (output.data = sales);
    return output;
  } catch (error) {
    (output.status = statusModel.internalServerError.code),
      (output.message = statusModel.internalServerError.message),
      (output.error = true),
      (output.data = error);
    return output;
  }
}

async function deleteSale(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    const product = await Sale.findByIdAndUpdate(
      data,
      { isDeleted: true, deleteDate: Date.now() },
      { new: true }
    );
    if (product) {
      const stockChange = await Stock.findOne({
        product_id: product.product_id,
      });
      stockChange.stockQuantity =
        stockChange.stockQuantity + product.quantitySold;
      await stockChange.save();
      (output.status = statusModel.success.code),
        (output.message = statusModel.success.message),
        (output.error = false),
        (output.data = product);
    } else {
      (output.status = statusModel.notFound.code),
        (output.message = statusModel.notFound.message),
        (output.error = true),
        (output.data = null);
    }
    return output;
  } catch (error) {
    (output.status = statusModel.internalServerError.code),
      (output.message = statusModel.internalServerError.message),
      (output.error = true),
      (output.data = error);
    return output;
  }
}

module.exports = {
  registerSales,
  monthlyReport,
  yearlyReport,
  reportByDate,
  searchByID,
  deleteSale,
};
