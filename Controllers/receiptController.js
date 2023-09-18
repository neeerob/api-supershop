const express = require("express");
const router = express.Router();
const Receipt = require("../models/receiptsModel");
const Sales = require("../models/salesModel");
const Stock = require("../models/stocksModel");
const ReceiptService = require("../lib/receiptService/seceiptService");
const errorModel = require("../utils/statusMessages");

router.use(express.json());

async function createReceipt(req, res) {
  let result = null;
  try {
    const salesArray = req.body;
    const result = await ReceiptService.createReceipt(salesArray);
    if (!result.error) {
      return res
        .status(result.status)
        .json({
          data: result.data,
          error: result.error,
          message: result.message,
        });
    } else {
      return res
        .status(result.status)
        .json({
          data: result.data,
          error: result.error,
          message: result.message,
        });
    }
  } catch (error) {
    console.log(error);
    let err = errorModel.internalServerError;
    result = {
      error: true,
      data: null,
      status: err.code,
      message: err.message,
    };
    return res.status(result.status).json(result);
  }
}

async function returnReceipt(req, res) {
  let result = null;
  try {
    const data = req.params.receiptNumber;
    const result = await ReceiptService.returnReceipt(data);
    if (!result.error) {
      return res
        .status(result.status)
        .json({
          data: result.data,
          error: result.error,
          message: result.message,
        });
    } else {
      return res
        .status(result.status)
        .json({
          data: result.data,
          error: result.error,
          message: result.message,
        });
    }
  } catch (error) {
    console.log(error);
    let err = errorModel.internalServerError;
    result = {
      error: true,
      data: null,
      status: err.code,
      message: err.message,
    };
    return res.status(result.status).json(result);
  }
}

async function returnByReceiptNumber(req, res) {
  let result = null;
  try {
    const data = req.params.receiptNumber;
    const result = await ReceiptService.returnByReceiptNumber(data);
    if (!result.error) {
      return res
        .status(result.status)
        .json({
          data: result.data,
          error: result.error,
          message: result.message,
        });
    } else {
      return res
        .status(result.status)
        .json({
          data: result.data,
          error: result.error,
          message: result.message,
        });
    }
  } catch (error) {
    console.log(error);
    let err = errorModel.internalServerError;
    result = {
      error: true,
      data: null,
      status: err.code,
      message: err.message,
    };
    return res.status(result.status).json(result);
  }
}

async function getAll(req, res) {
  let result = null;
  try {
    const data = req.query;
    const result = await ReceiptService.getAll(data);
    if (!result.error) {
      return res
        .status(result.status)
        .json({
          data: result.data,
          error: result.error,
          message: result.message,
        });
    } else {
      return res
        .status(result.status)
        .json({
          data: result.data,
          error: result.error,
          message: result.message,
        });
    }
  } catch (error) {
    console.log(error);
    let err = errorModel.internalServerError;
    result = {
      error: true,
      data: null,
      status: err.code,
      message: err.message,
    };
    return res.status(result.status).json(result);
  }
}

async function getReceiptByDate(req, res) {
  let result = null;
  try {
    let data = req.body;
    const result = await ReceiptService.getReceiptByDate(data);
    if (!result.error) {
      return res
        .status(result.status)
        .json({
          data: result.data,
          error: result.error,
          message: result.message,
        });
    } else {
      return res
        .status(result.status)
        .json({
          data: result.data,
          error: result.error,
          message: result.message,
        });
    }
  } catch (error) {
    console.log(error);
    let err = errorModel.internalServerError;
    result = {
      error: true,
      data: null,
      status: err.code,
      message: err.message,
    };
    return res.status(result.status).json(result);
  }
}

module.exports = {
  createReceipt,
  returnReceipt,
  returnByReceiptNumber,
  getAll,
  getReceiptByDate,
};
