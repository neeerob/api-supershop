const mongoose = require("mongoose");
const Product = require("../../models/productModel");
const Stock = require("../../models/stocksModel");
const statusModel = require("../../utils/statusMessages");

/**
 * getAll  -
 * @param {object}
 * @returns  {object}
 */

async function getAllProducts(data) {
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

    const products = await Product.find({ isDeleted: false })
      .skip(skip)
      .limit(pageSize);

    (output.status = statusModel.success.code),
      (output.message = statusModel.success.message),
      (output.error = false),
      (output.data = products);

    return output;
  } catch (error) {
    (output.status = statusModel.internalServerError.code),
      (output.message = statusModel.internalServerError.message),
      (output.error = true),
      (output.data = error);
    return output;
  }
}

async function searchProductByID(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    const product = await Product.findById(data);
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

async function searchProductByKey(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };
  let key = data.key;
  // console.log(key);

  try {
    const product = await Product.find({
      $or: [{ productName: key }, { description: key }],
    });
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

async function deleteProduct(data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    const product = await await Product.findByIdAndUpdate(
      data,
      { isDeleted: true, deleteDate: Date.now() },
      { new: true }
    );
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

async function updateProduct(Id, data) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    let product = await Product.findByIdAndUpdate(
      Id,
      data,
      { $set: { isDeleted: false } },
      { new: true }
    );
    if (product) {
      (output.status = statusModel.success.code),
        (output.message = statusModel.success.message),
        (output.error = false),
        (output.data = await Product.findById(Id));
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

async function addProduct(data, quantityParam) {
  let output = {
    status: 200,
    error: false,
    data: null,
    message: "",
  };

  try {
    let product = await Product.create(data);

    const stockEntry = new Stock({
      product_id: product._id,
      stockQuantity: quantityParam,
    });
    await stockEntry.save();
    if (product && stockEntry) {
      (output.status = statusModel.created.code),
        (output.message = statusModel.created.message),
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
  getAllProducts,
  searchProductByID,
  deleteProduct,
  updateProduct,
  addProduct,
  searchProductByKey,
};
