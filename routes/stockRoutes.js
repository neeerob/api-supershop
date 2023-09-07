const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const stockController = require('../Controllers/stockController')
router.use(express.json());

// router.get('/all/:page?/:pageSize?', productController.getAll);
router.put('/updateStock/:product_id/:quantity', stockController.updateStock)
router.get('/all',stockController.getAll);
router.get('/byid/:id',stockController.searchById);
router.get('/bypid/:id',stockController.searchByProductId);

module.exports = router;