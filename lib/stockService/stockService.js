const Product = require("../../models/productModel");
const Stock = require("../../models/stocksModel");
const statusModel = require("../../utils/statusMessages");

async function getAllStocks(data) {
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

    const stock = await Stock.find({ isDeleted: false })
      .skip(skip)
      .limit(pageSize);

    (output.status = statusModel.success.code),
      (output.message = statusModel.success.message),
      (output.error = false),
      (output.data = stock);
    return output;
  } catch (error) {
    (output.status = statusModel.internalServerError.code),
      (output.message = statusModel.internalServerError.message),
      (output.error = true),
      (output.data = error);
    return output;
  }
}

async function searchStockByID(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };
  try {
    const product = await Stock.findById(data);
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

async function searchStockByProductID(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };
  try {
    const product = await Stock.findOne({ product_id: data });
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

async function updateStock(productId, stockQuantity) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    const stockEntry = await Stock.findOne({ product_id: productId });
    if (!stockEntry) {
      (output.status = statusModel.notFound.code),
        (output.message = statusModel.notFound.message),
        (output.error = true),
        (output.data = null);
    }

    if (stockEntry.stockQuantity + stockQuantity >= 0) {
      stockEntry.stockQuantity =
        parseInt(stockEntry.stockQuantity) + parseInt(stockQuantity);
      let response = await stockEntry.save();
      //or secound method
      if (!response) {
        (output.status = statusModel.internalServerError.code),
          (output.message = err.message),
          (output.error = true),
          (output.data = err);
      } else {
        (output.status = statusModel.success.code),
          (output.message = statusModel.success.message),
          (output.error = false),
          (output.data = stockEntry);
      }
    } else {
      (output.status = statusModel.conflict.code),
        (output.message = "In sufficient stock"),
        (output.error = false),
        (output.data = stockEntry);
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
  getAllStocks,
  searchStockByID,
  searchStockByProductID,
  updateStock,
};
