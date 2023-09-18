const chai = require("chai");
const chaiHttp = require("chai-http");
// const app = require('../server');
const SaleService = require("../lib/salesService/salesService");
const ProductService = require("../lib/productService/productService");

chai.use(chaiHttp);
const expect = chai.expect;
let salesId = null;
let productId = null;

describe("Sales Service", () => {
  describe("Register sale", () => {
    it("Should register a sele", async function () {
      this.timeout(10000);
      const data1 = {
        page: 1,
        pageSize: 5,
      };

      const responseProduct = await ProductService.getAllProducts(data1);
      productId = responseProduct.data[0]._id;

      const data = {
        productId: productId,
        quantitySold: 1,
        salePrice: 15,
      };
      const dicount = 200;
      const response = await SaleService.registerSales(data, dicount);

      expect(response.error).to.be.false;

      expect(response).to.have.property("status");
      expect(response).to.have.property("error");
      expect(response).to.have.property("data");
      expect(response).to.have.property("message");
      expect(response.status).to.be.a("number");
      expect(response.error).to.be.a("boolean");
      expect(response.message).to.be.a("string");
    });
  });

  describe("Monthly Sales Report", () => {
    it("Should return a monthly sales report", async function () {
      this.timeout(15000);

      const response = await SaleService.monthlyReport();

      expect(response.status).to.equal(200);
      expect(response.error).to.be.false;
      expect(response.data).to.be.an("array");

      expect(response).to.have.property("status");
      expect(response).to.have.property("error");
      expect(response).to.have.property("data");
      expect(response).to.have.property("message");
      expect(response.status).to.be.a("number");
      expect(response.error).to.be.a("boolean");
      expect(response.message).to.be.a("string");
    });
  });

  describe("Yearly Sales Report", () => {
    it("Should return a yearly sales report", async function () {
      this.timeout(15000);

      const response = await SaleService.monthlyReport();

      expect(response.status).to.equal(200);
      expect(response.error).to.be.false;
      expect(response.data).to.be.an("array");

      expect(response).to.have.property("status");
      expect(response).to.have.property("error");
      expect(response).to.have.property("data");
      expect(response).to.have.property("message");
      expect(response.status).to.be.a("number");
      expect(response.error).to.be.a("boolean");
      expect(response.message).to.be.a("string");
    });
  });

  describe("Report by date", () => {
    it("Should return a yearly sales report", async function () {
      this.timeout(15000);

      const data = {
        productId: "64f6d77ff8a997c4594dec1c",
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      };

      const response = await SaleService.reportByDate(data);

      expect(response.status).to.equal(200);
      expect(response.error).to.be.false;
      expect(response.data).to.be.an("array");

      expect(response).to.have.property("status");
      expect(response).to.have.property("error");
      expect(response).to.have.property("data");
      expect(response).to.have.property("message");
      expect(response.status).to.be.a("number");
      expect(response.error).to.be.a("boolean");
      expect(response.message).to.be.a("string");
    });
  });
});
