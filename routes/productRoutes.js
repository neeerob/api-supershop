const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const productController = require('../Controllers/productControllers')
router.use(express.json());

router.get('/all', productController.getAll);
router.post('/add', productController.addProduct);
router.patch('/update/:id', productController.updateProduct);
router.delete('/delete/:id',productController.deleteProduct);
router.get('/:id',productController.searchById);

module.exports = router;