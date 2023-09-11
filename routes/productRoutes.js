const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const productController = require('../Controllers/productControllers')
router.use(express.json());

router.get('/all', productController.getAll);
router.post('/add', productController.addProduct);
router.get('/update/:id', productController.updateProduct);
router.delete('/delete/:id',productController.deleteProduct);
router.get('/:id',productController.searchById);
router.post('/bykey',productController.searchByKey);

module.exports = router;