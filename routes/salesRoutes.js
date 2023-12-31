const express = require("express");
const router = express.Router();
const salesController = require("../Controllers/salesController");
router.use(express.json());

router.post("/registerSales/:discount", salesController.registerSales);
// router.get("/monthlySalesReport", salesController.monthlyReport);
router.post("/dailySalesReport", salesController.dailySalesReport);
// router.get("/yearlySalesReport", salesController.yearlyReport);
// router.get("/getSalesReportByDate", salesController.reportByDate);
router.get("/getsalesbyid/:id", salesController.searchById);
router.delete("/deleteSale/:id", salesController.deleteSale);
router.post("/monthlySalesReport", salesController.reportMonthly);

module.exports = router;
