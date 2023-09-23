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

async function dailyReport(data) {
  const output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    // const desiredDate = new Date(data);
    // desiredDate.setHours(23, 59, 59, 999);

    // const sales = await Sale.find({
    //   createDate: {
    //     $gte: desiredDate,
    //   },
    //   isDeleted: false,
    // });

    const desiredDate = new Date(data);
    desiredDate.setUTCHours(0, 0, 0, 0);

    const nextDay = new Date(desiredDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const sales = await Sale.find({
      createDate: {
        $gte: desiredDate,
        $lt: nextDay,
      },
      isDeleted: false,
    });

    const dailySalesData = {};

    for (const sale of sales) {
      const date = sale.createDate.toISOString().split("T")[0];
      const productId = sale.product_id.toString();

      if (!dailySalesData[date]) {
        dailySalesData[date] = {
          totalRevenue: 0,
          totalUnitsSold: 0,
          totalProfit: 0,
          totalLoss: 0,
          totalCostPrice: 0,
          products: {},
        };
      }

      const productRevenue = sale.quantitySold * sale.salePrice;
      const productProfit =
        sale.quantitySold * (sale.salePrice - sale.costPrice);
      const productCostPrice = sale.quantitySold * sale.costPrice;

      dailySalesData[date].totalRevenue += productRevenue;
      dailySalesData[date].totalUnitsSold += sale.quantitySold;
      dailySalesData[date].totalProfit += productProfit;
      dailySalesData[date].totalCostPrice += productCostPrice;

      if (!dailySalesData[date].products[productId]) {
        const product = await Product.findById(productId);
        const productName = product ? product.productName : "Product Not Found";

        dailySalesData[date].products[productId] = {
          product_id: productId,
          productName,
          totalRevenue: 0,
          totalUnitsSold: 0,
          totalProfit: 0,
          totalLoss: 0,
          totalCostPrice: 0,
        };
      }

      const productData = dailySalesData[date].products[productId];
      productData.totalRevenue += productRevenue;
      productData.totalUnitsSold += sale.quantitySold;
      productData.totalProfit += productProfit;
      productData.totalCostPrice += productCostPrice;
    }

    for (const date in dailySalesData) {
      const dayData = dailySalesData[date];

      for (const productId in dayData.products) {
        const productData = dayData.products[productId];

        if (productData.totalProfit < 0) {
          productData.totalLoss = -productData.totalProfit;
          productData.totalProfit = 0;
        } else {
          productData.totalLoss = 0;
        }
      }

      if (dayData.totalProfit < 0) {
        dayData.totalLoss = -dayData.totalProfit;
        dayData.totalProfit = 0;
      } else {
        dayData.totalLoss = 0;
      }
    }

    const dailySales = Object.entries(dailySalesData).map(([date, data]) => ({
      date,
      ...data,
      products: Object.values(data.products),
    }));

    output.status = 200;
    output.message = "Success";
    output.error = false;
    output.data = dailySales;

    return output;
  } catch (error) {
    output.status = 500;
    output.message = "Internal Server Error";
    output.error = true;
    output.data = error.message;

    return output;
  }
}

// async function dailyReport(data) {
//   const output = {
//     status: 200,
//     error: false,
//     data: null,
//     message: "",
//   };

//   try {
//     const desiredDate = new Date(data);
//     desiredDate.setHours(23, 59, 59, 999);

//     const sales = await Sale.find({
//       createDate: {
//         $gte: desiredDate,
//       },
//       isDeleted: false,
//     });

//     const dailySalesData = {};

//     for (const sale of sales) {
//       const date = sale.createDate.toISOString().split("T")[0];
//       const productId = sale.product_id.toString();

//       if (!dailySalesData[date]) {
//         dailySalesData[date] = {
//           totalRevenue: 0,
//           totalUnitsSold: 0,
//           totalProfit: 0,
//           totalLoss: 0,
//           totalCostPrice: 0,
//           products: {},
//         };
//       }

//       const productRevenue = sale.quantitySold * sale.salePrice;
//       const productProfit =
//         sale.quantitySold * (sale.salePrice - sale.costPrice);
//       const productCostPrice = sale.quantitySold * sale.costPrice;

//       dailySalesData[date].totalRevenue += productRevenue;
//       dailySalesData[date].totalUnitsSold += sale.quantitySold;
//       dailySalesData[date].totalProfit += productProfit;
//       dailySalesData[date].totalCostPrice += productCostPrice;

//       dailySalesData[date].totalLoss = Math.min(
//         dailySalesData[date].totalProfit,
//         0
//       );
//       dailySalesData[date].totalProfit =
//         dailySalesData[date].totalLoss < 0
//           ? 0
//           : dailySalesData[date].totalProfit;

//       if (!dailySalesData[date].products[productId]) {
//         const product = await Product.findById(productId);
//         const productName = product ? product.productName : "Product Not Found";

//         dailySalesData[date].products[productId] = {
//           product_id: productId,
//           productName,
//           totalRevenue: 0,
//           totalUnitsSold: 0,
//           totalProfit: 0,
//           totalLoss: 0,
//           totalCostPrice: 0,
//         };
//       }

//       const productData = dailySalesData[date].products[productId];
//       productData.totalRevenue += productRevenue;
//       productData.totalUnitsSold += sale.quantitySold;
//       productData.totalProfit += productProfit;
//       productData.totalCostPrice += productCostPrice;

//       console.log("loss" + productData.totalLoss);
//       console.log("profit" + productData.totalProfit);

//       if (productData.totalProfit < 0) {
//         productData.totalLoss = productData.totalProfit;
//         productData.totalProfit = 0;
//       } else {
//         productData.totalLoss = 0;
//       }
//     }

//     const dailySales = Object.entries(dailySalesData).map(([date, data]) => ({
//       date,
//       ...data,
//       products: Object.values(data.products),
//     }));

//     output.status = 200;
//     output.message = "Success";
//     output.error = false;
//     output.data = dailySales;

//     return output;
//   } catch (error) {
//     output.status = 500;
//     output.message = "Internal Server Error";
//     output.error = true;
//     output.data = error.message;

//     return output;
//   }
// }

// async function dailyReport(data) {
//   const output = {
//     status: 200,
//     error: false,
//     data: null,
//     message: "",
//   };

//   try {
//     const desiredDate = new Date(data);
//     desiredDate.setHours(0, 0, 0, 0); // Set the time to the beginning of the day.

//     const sales = await Sale.find({
//       createDate: {
//         $gte: desiredDate,
//         $lt: new Date(desiredDate.getTime() + 24 * 60 * 60 * 1000), // Set the end time to the end of the day.
//       },
//       isDeleted: false,
//     });

//     const dailySalesData = {
//       date: desiredDate.toISOString().split("T")[0], // Get the date in ISO format.
//       totalRevenue: 0,
//       totalUnitsSold: 0,
//       totalProfit: 0,
//       totalLoss: 0,
//       totalCostPrice: 0,
//       products: {},
//     };

//     for (const sale of sales) {
//       const productId = sale.product_id.toString();

//       const productRevenue = sale.quantitySold * sale.salePrice;
//       const productProfit =
//         sale.quantitySold * (sale.salePrice - sale.costPrice);
//       const productCostPrice = sale.quantitySold * sale.costPrice;

//       dailySalesData.totalRevenue += productRevenue;
//       dailySalesData.totalUnitsSold += sale.quantitySold;
//       dailySalesData.totalProfit += productProfit;
//       dailySalesData.totalCostPrice += productCostPrice;

//       dailySalesData.totalLoss = Math.min(dailySalesData.totalProfit, 0);
//       dailySalesData.totalProfit =
//         dailySalesData.totalLoss < 0 ? 0 : dailySalesData.totalProfit;

//       if (!dailySalesData.products[productId]) {
//         const product = await Product.findById(productId);
//         const productName = product ? product.productName : "Product Not Found";

//         dailySalesData.products[productId] = {
//           product_id: productId,
//           productName,
//           totalRevenue: 0,
//           totalUnitsSold: 0,
//           totalProfit: 0,
//           totalLoss: 0,
//           totalCostPrice: 0,
//         };
//       }

//       const productData = dailySalesData.products[productId];
//       productData.totalRevenue += productRevenue;
//       productData.totalUnitsSold += sale.quantitySold;
//       productData.totalProfit += productProfit;
//       productData.totalCostPrice += productCostPrice;

//       productData.totalLoss = Math.min(productData.totalProfit, 0);
//       productData.totalProfit =
//         productData.totalLoss < 0 ? 0 : productData.totalProfit;
//     }

//     output.status = 200;
//     output.message = "Success";
//     output.error = false;
//     output.data = dailySalesData;

//     return output;
//   } catch (error) {
//     output.status = 500;
//     output.message = "Internal Server Error";
//     output.error = true;
//     output.data = error.message;

//     return output;
//   }
// }

// Usage
dailyReport()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });

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
  dailyReport,
};
