const Product = require("../../models/productModel");
const Stock = require("../../models/stocksModel");
const Sale = require("../../models/salesModel");
const DailyProductSale = require("../../models/dailyProductSales");
const MonthlySale = require("../../models/monthlySalesReport");
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

//everything os working in this function...V1.1
async function dailyReport(data) {
  const output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
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
    let currentDate = new Date();
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

//everything is working fine.....v1.1
// async function pathDecider(data) {
//   let output = {
//     status: 200,
//     error: false,
//     data: [],
//     message: "",
//   };
//   try {
//     const desiredDate = new Date(data);
//     //<-here
//     let currentDate = new Date();
//     if (
//       desiredDate.setUTCHours(0, 0, 0, 0) ===
//       currentDate.setUTCHours(0, 0, 0, 0)
//     ) {
//       const result = await dailyReport(data);
//       output.status = result.status;
//       output.message = result.message;
//       output.error = result.error;
//       output.data = result.data[0];

//       if (result.data.length === 0) {
//         console.log("Empty");
//       } else {
//         try {
//           const existingRecord = await DailyProductSale.findOne({ date: data });
//           const existingSales = await MonthlySale.findOne({ date: data });
//           if (existingRecord && existingSales) {
//             existingRecord.products = output.data.products;
//             existingSales.totalCostPrice = output.data.totalCostPrice;
//             existingSales.totalLoss = output.data.totalLoss;
//             existingSales.totalProfit = output.data.totalProfit;
//             existingSales.totalRevenue = output.data.totalRevenue;
//             existingSales.totalUnitsSold = output.data.totalUnitsSold;

//             await existingRecord.save();
//             await existingSales.save();
//           } else {
//             const newRecord = new DailyProductSale({
//               date: data,
//               products: output.data.products,
//             });
//             const newMonthlySalesRecord = new MonthlySale({
//               date: data,
//               totalCostPrice: output.data.totalCostPrice,
//               totalLoss: output.data.totalLoss,
//               totalProfit: output.data.totalProfit,
//               totalRevenue: output.data.totalRevenue,
//               totalUnitsSold: output.data.totalUnitsSold,
//             });
//             await newRecord.save();
//             await newMonthlySalesRecord.save();
//           }
//         } catch (error) {
//           output.status = 500;
//           output.message = "Internal Server Error";
//           output.error = true;
//           output.data = error.message;
//         }
//       }
//     } else if (
//       desiredDate.setUTCHours(0, 0, 0, 0) > currentDate.setUTCHours(0, 0, 0, 0)
//     ) {
//       output.status = 404;
//       output.message = "FutureData";
//       output.error = false;
//       output.data = null;
//     } else {
//       const existingRecord = await DailyProductSale.findOne({ date: data });
//       const existingSales = await MonthlySale.findOne({ date: data });
//       if (existingRecord && existingSales) {
//         const outputdata = {
//           date: existingSales.date,
//           totalCostPrice: existingSales.totalCostPrice,
//           totalLoss: existingSales.totalLoss,
//           totalProfit: existingSales.totalProfit,
//           totalRevenue: existingSales.totalRevenue,
//           totalUnitsSold: existingSales.totalUnitsSold,
//           products: existingRecord.products,
//         };
//         output.status = 200;
//         output.message = "success";
//         output.error = false;
//         output.data = outputdata;
//       } else {
//         output.status = 200;
//         output.message = "success";
//         output.error = false;
//         output.data = null;
//       }
//     }
//     return output;
//   } catch (error) {
//     output.status = 500;
//     output.message = "Internal Server Error";
//     output.error = true;
//     output.data = error.message;

//     return output;
//   }
// }

async function pathDecider(data) {
  let output = {
    status: 200,
    error: false,
    data: [],
    message: "",
  };
  try {
    const desiredDate = new Date(data);
    //<-here
    let currentDate = new Date();
    if (
      desiredDate.setUTCHours(0, 0, 0, 0) ===
      currentDate.setUTCHours(0, 0, 0, 0)
    ) {
      const result = await dailyReport(data);
      // console.log("Current date...Fetching current data....");
      output.status = result.status;
      output.message = result.message;
      output.error = result.error;
      output.data = result.data[0];

      if (result.data.length === 0) {
        // console.log("Empty");
        output.status = result.status;
        output.message = result.message;
        output.error = result.error;
        output.data = null;
      } else {
        try {
          const existingRecord = await DailyProductSale.find({ date: data });
          const existingSales = await MonthlySale.findOne({ date: data });
          if (existingRecord.length && existingSales) {
            // console.log("...exist....");
            const result = await DailyProductSale.deleteMany({ date: data });
            // console.log("...deleted previous data....");
            if (result) {
              existingSales.totalCostPrice = output.data.totalCostPrice;
              existingSales.totalLoss = output.data.totalLoss;
              existingSales.totalProfit = output.data.totalProfit;
              existingSales.totalRevenue = output.data.totalRevenue;
              existingSales.totalUnitsSold = output.data.totalUnitsSold;
              // console.log("...updated monthly data....");

              const myAllProductsInfo = output.data.products;
              for (const product of myAllProductsInfo) {
                const newRecord = new DailyProductSale({
                  date: data,
                  product_id: product.product_id,
                  productName: product.productName,
                  totalCostPrice: product.totalCostPrice,
                  totalLoss: product.totalLoss,
                  totalProfit: product.totalProfit,
                  totalRevenue: product.totalRevenue,
                  totalUnitsSold: product.totalUnitsSold,
                });
                await newRecord.save();
                // console.log("...hit....");
              }
              // console.log("...added new daily data....");
            } else {
              output.status = 500;
              output.message = "Internal Server Error";
              output.error = true;
              output.data = null;
            }
            // existingRecord.products = output.data.products;
          } else {
            // console.log("...doesn't exist....need to create......");
            const myAllProductsInfo = output.data.products;
            for (const product of myAllProductsInfo) {
              const newRecord = new DailyProductSale({
                date: data,
                product_id: product.product_id,
                productName: product.productName,
                totalCostPrice: product.totalCostPrice,
                totalLoss: product.totalLoss,
                totalProfit: product.totalProfit,
                totalRevenue: product.totalRevenue,
                totalUnitsSold: product.totalUnitsSold,
              });
              await newRecord.save();
            }
            // console.log("...added new product in daily product......");
            const newMonthlySalesRecord = new MonthlySale({
              date: data,
              totalCostPrice: output.data.totalCostPrice,
              totalLoss: output.data.totalLoss,
              totalProfit: output.data.totalProfit,
              totalRevenue: output.data.totalRevenue,
              totalUnitsSold: output.data.totalUnitsSold,
            });
            await newMonthlySalesRecord.save();
            // console.log("...added added monthly data......");
          }
        } catch (error) {
          output.status = 500;
          output.message = "Internal Server Error";
          output.error = true;
          output.data = error.message;
        }
      }
    } else if (
      desiredDate.setUTCHours(0, 0, 0, 0) > currentDate.setUTCHours(0, 0, 0, 0)
    ) {
      // console.log("...future data......");
      output.status = 404;
      output.message = "FutureData";
      output.error = false;
      output.data = null;
    } else {
      // console.log("...past data......");
      const existingRecord = await DailyProductSale.find({ date: data });
      const existingSales = await MonthlySale.findOne({ date: data });
      if (existingRecord && existingSales) {
        const outputdata = {
          date: existingSales.date,
          totalCostPrice: existingSales.totalCostPrice,
          totalLoss: existingSales.totalLoss,
          totalProfit: existingSales.totalProfit,
          totalRevenue: existingSales.totalRevenue,
          totalUnitsSold: existingSales.totalUnitsSold,
          products: existingRecord,
        };
        // console.log("...past data sample......");
        console.log(outputdata);
        output.status = 200;
        output.message = "success";
        output.error = false;
        output.data = outputdata;
      } else {
        output.status = 200;
        output.message = "success";
        output.error = false;
        output.data = null;
      }
    }
    return output;
  } catch (error) {
    output.status = 500;
    output.message = "Internal Server Error";
    output.error = true;
    output.data = error.message;

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
  dailyReport,
  pathDecider,
};
