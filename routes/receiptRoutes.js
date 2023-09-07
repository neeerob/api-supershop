const express = require("express");
const router = express.Router();
const receiptController = require('../Controllers/receiptController');
router.use(express.json());

router.post("/crtrct", receiptController.createReceipt);
router.get('/retrnPrdt/:receiptNumber', receiptController.returnReceipt);
router.get("/getReceiptByReceiptNumber/:receiptNumber", receiptController.returnByReceiptNumber);
router.get("/getAllReceipt", receiptController.getAll);
router.get("/getReceiptByDate", receiptController.getReceiptByDate);

module.exports = router;