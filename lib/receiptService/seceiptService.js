const Product = require("../../models/productModel");
const Stock = require("../../models/stocksModel");
const Sale = require("../../models/salesModel");
const Receipt = require("../../models/receiptsModel");
const DailyProductSale = require("../../models/dailyProductSales");
const MonthlySale = require("../../models/monthlySalesReport");
const statusModel = require("../../utils/statusMessages");

async function getReceiptByDate(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    const { startDate, endDate } = data;
    if (startDate != null && endDate != null) {
      const query = {
        isDeleted: false,
        createDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
      const receipts = await Receipt.find(query);
      (output.status = statusModel.success.code),
        (output.message = statusModel.success.message),
        (output.error = false),
        (output.data = receipts);
    } else {
      (output.status = statusModel.notFound.code),
        (output.message = "Missing start and end-date"),
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

async function getAll(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    const page = data.page ? parseInt(data.page) : 1;
    const pageSize = data.pageSize ? parseInt(data.pageSize) : 10;

    const skip = (page - 1) * pageSize;

    const receipt = await Receipt.find({ isDeleted: false })
      .skip(skip)
      .limit(pageSize);

    (output.status = statusModel.success.code),
      (output.message = statusModel.success.message),
      (output.error = false),
      (output.data = receipt);
    return output;
  } catch (error) {
    (output.status = statusModel.internalServerError.code),
      (output.message = statusModel.internalServerError.message),
      (output.error = true),
      (output.data = error);
    return output;
  }
}

async function returnByReceiptNumber(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };
  try {
    const receiptNumber = data;
    const receipt = await Receipt.findOne({ receiptNumber: receiptNumber });
    if (receipt == null) {
      (output.status = statusModel.notFound.code),
        (output.message = statusModel.notFound.message),
        (output.error = true),
        (output.data = null);
    } else {
      (output.status = statusModel.success.code),
        (output.message = statusModel.success.message),
        (output.error = false),
        (output.data = receipt);
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

//return receipy everything is done v1.1
async function returnReceipt(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    const receiptNumber = data;
    const receipt = await Receipt.findOne({ receiptNumber: receiptNumber });
    if (receipt && receipt.isActive == true) {
      const selesIds = receipt.selesId;
      const saleIDStrings = selesIds.map((saleData) =>
        saleData.sele_id.toString()
      );
      for (let i = 0; i < saleIDStrings.length; i++) {
        let salePush = await Sale.findById(saleIDStrings[i]);
        let stockPush = await Stock.findOne({
          product_id: salePush.product_id,
        });
        stockPush.stockQuantity += salePush.quantitySold;
        salePush.isDeleted = true;
        salePush.isActive = false;
        salePush.deleteDate = Date.now();
        receipt.isActive = false;
        receipt.isDeleted = true;
        await receipt.save();
        await salePush.save();
        await stockPush.save();
      }
      (output.status = statusModel.success.code),
        (output.message = statusModel.success.message),
        (output.error = false),
        (output.data = receipt);
    } else {
      (output.status = statusModel.internalServerError.code),
        (output.message = "Receipt don't exist"),
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

async function returnReceipt(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    const receiptNumber = data;
    const receipt = await Receipt.findOne({ receiptNumber: receiptNumber });
    if (receipt && receipt.isActive == true) {
      const selesIds = receipt.selesId;
      const saleIDStrings = selesIds.map((saleData) =>
        saleData.sele_id.toString()
      );
      for (let i = 0; i < saleIDStrings.length; i++) {
        let salePush = await Sale.findById(saleIDStrings[i]);
        let stockPush = await Stock.findOne({
          product_id: salePush.product_id,
        });

        // Undo the changes made by the original sale in daily sales report
        try {
          // const today = new Date();
          // let day, month, year;
          // day = today.getDate();
          // month = today.getMonth();
          // year = today.getFullYear();

          // const currentDate = new Date(`${year}-${month}-${day}`);
          // let nextDate = new Date(`${year}-${month}-${day + 1}`);
          const currentDate = new Date(receipt.date);
          currentDate.setUTCHours(0, 0, 0, 0);
          const nextDate = new Date(currentDate);
          nextDate.setDate(nextDate.getDate() + 1);

          const dailySalesReport = await DailyProductSale.findOne({
            product_id: salePush.product_id,
            date: {
              $gte: currentDate,
              $lt: nextDate,
            },
          });
          console.log("hi");
          console.log(dailySalesReport);

          if (dailySalesReport && dailySalesReport.totalUnitsSold > 0) {
            dailySalesReport.totalCostPrice -=
              salePush.costPrice * salePush.quantitySold;
            dailySalesReport.totalRevenue -=
              salePush.salePrice * salePush.quantitySold;
            dailySalesReport.totalUnitsSold -= salePush.quantitySold;
            dailySalesReport.totalProfit -=
              salePush.salePrice > salePush.costPrice
                ? (salePush.salePrice - salePush.costPrice) *
                    salePush.quantitySold +
                  salePush.discount
                : 0;
            dailySalesReport.totalLoss -=
              salePush.salePrice < salePush.costPrice
                ? (salePush.costPrice - salePush.salePrice) *
                    salePush.quantitySold +
                  salePush.discount
                : 0;

            await dailySalesReport.save();
          } else {
            console.log("not found");
          }
        } catch (error) {
          console.log(error);
        }

        // Undo the changes made by the original sale in monthly sales report

        try {
          const currentTime = new Date(receipt.date);
          currentTime.setUTCHours(0, 0, 0, 0);
          let nextDay = new Date(currentTime);
          nextDay.setDate(nextDay.getDate() + 1);

          const monthlySalesReport = await MonthlySale.findOne({
            date: {
              $gte: currentTime,
              $lt: nextDay,
            },
          });
          console.log("h");
          console.log(monthlySalesReport);

          if (monthlySalesReport) {
            monthlySalesReport.totalCostPrice -=
              salePush.costPrice * salePush.quantitySold;
            monthlySalesReport.totalRevenue -=
              salePush.salePrice * salePush.quantitySold;
            monthlySalesReport.totalUnitsSold -= salePush.quantitySold;
            monthlySalesReport.totalProfit -=
              salePush.salePrice > salePush.costPrice
                ? (salePush.salePrice - salePush.costPrice) *
                    salePush.quantitySold +
                  salePush.discount
                : 0;
            monthlySalesReport.totalLoss -=
              salePush.salePrice < salePush.costPrice
                ? (salePush.costPrice - salePush.salePrice) *
                    salePush.quantitySold +
                  salePush.discount
                : 0;

            await monthlySalesReport.save();
          } else {
            console.log("not found 2");
          }
        } catch (error) {
          console.log(error);
        }

        stockPush.stockQuantity += salePush.quantitySold;
        salePush.isDeleted = true;
        salePush.isActive = false;
        salePush.deleteDate = Date.now();

        receipt.isActive = false;
        await receipt.save();
        await salePush.save();
        await stockPush.save();
      }
      output.status = statusModel.success.code;
      output.message = statusModel.success.message;
      output.error = false;
      output.data = receipt;
    } else {
      output.status = statusModel.internalServerError.code;
      output.message = "Receipt don't exist";
      output.error = true;
      output.data = null;
    }
    return output;
  } catch (error) {
    output.status = statusModel.internalServerError.code;
    output.message = statusModel.internalServerError.message;
    output.error = true;
    output.data = error;
    return output;
  }
}

async function createReceipt(salesArray) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };
  console.log("sa", salesArray);

  try {
    let multipleSaleIdFlag = false;
    let sellExistFlag = true;
    let notFoundSaleID = null;
    const productIdCount = {};

    for (const saleData of salesArray) {
      const { saleId } = saleData;

      if (productIdCount[saleId]) {
        multipleSaleIdFlag = true;
      }
      productIdCount[saleId] = (productIdCount[saleId] || 0) + 1;
    }
    if (multipleSaleIdFlag) {
      (output.status = statusModel.internalServerError.code),
        (output.message = "Multiple same sales Id found in same receipt"),
        (output.error = true),
        (output.data = null);
    } else {
      for (const saleData of salesArray) {
        const { saleId } = saleData;
        const sale = await Sale.findById(saleId);
        if (sale == null) {
          sellExistFlag = false;
          notFoundSaleID = saleId;
        }
      }

      if (sellExistFlag == true) {
        let calCotalAmmount = 0;
        let totalDiscountAmmount = 0;
        let salesId = [];
        for (const saleData of salesArray) {
          const { saleId } = saleData;
          const salePush = await Sale.findById(saleId);
          calCotalAmmount += salePush.quantitySold * salePush.salePrice;
          totalDiscountAmmount += salePush.discount;
          salesId.push({
            sele_id: saleId,
          });
        }
        let tax_amount = parseInt(calCotalAmmount) * process.env.db_taxPercent;
        let grand_Total = calCotalAmmount + tax_amount - totalDiscountAmmount;
        const receiptData = {
          receiptNumber: generateReceiptNumber(),
          totalAmount: calCotalAmmount,
          discount: totalDiscountAmmount,
          taxAmmount: tax_amount,
          grandTotal: grand_Total,
          date: new Date(),
          selesId: salesId,
        };
        const receipt = new Receipt(receiptData);
        await receipt.save();
        (output.status = statusModel.success.code),
          (output.message = statusModel.success.message),
          (output.error = false),
          (output.data = receipt);
      } else {
        (output.status = statusModel.internalServerError.code),
          (output.message = "Saleid don't exist in database"),
          (output.error = true),
          (output.data = null);
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

function generateReceiptNumber() {
  const prefix = "SCPT";
  const timestamp = Date.now();
  const randomDigits = Math.floor(Math.random() * 10000);

  return `${prefix}${timestamp}${randomDigits}`;
}

module.exports = {
  getReceiptByDate,
  getAll,
  returnByReceiptNumber,
  returnReceipt,
  createReceipt,
};
