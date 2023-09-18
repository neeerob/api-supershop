const chai = require("chai");
const chaiHttp = require("chai-http");
// const app = require('../server');
const ProductService = require("../lib/productService/productService");
const StockService = require("../lib/stockService/stockService");

chai.use(chaiHttp);
const expect = chai.expect;
let productId = null;

describe("Product Service", () => {
  describe("Get All Products", () => {
    it("Should return an array of products", async function () {
      this.timeout(15000);

      const data = {
        page: 1,
        pageSize: 5,
      };
      const response = await ProductService.getAllProducts(data);

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

  describe("Add Product", () => {
    it("Should return added products and create a stock for that product", async function () {
      this.timeout(10000);

      const data = {
        productName: "Pen",
        description: " description pen - 2",
        price: 5,
        status: true,
        isActive: true,
        isDeleted: false,
        createDate: "2023-09-02T12:00:00Z",
        deleteDate: null,
      };

      const defaultQuantity = 20;

      const response = await ProductService.addProduct(data, defaultQuantity);

      productId = response.data._id;

      const response2 = await StockService.searchStockByProductID(productId);

      expect(response2.status).to.equal(200);
      expect(response2.error).to.be.false;
      expect(response2.data.stockQuantity).to.equal(defaultQuantity);

      expect(response2).to.have.property("status");
      expect(response2).to.have.property("error");
      expect(response2).to.have.property("data");
      expect(response2).to.have.property("message");

      expect(response.status).to.equal(201);
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

  describe("Giving incorreect Product details", () => {
    it("Should not return a product", async function () {
      this.timeout(10000);

      const data = {
        price: 5,
        status: true,
        isActive: true,
        isDeleted: false,
        createDate: "2023-09-02T12:00:00Z",
        deleteDate: null,
      };

      const defaultQuantity = 20;

      const response = await ProductService.addProduct(data, defaultQuantity);

      const response2 = await StockService.searchStockByProductID(
        response.data._id
      );

      expect(response2.status).to.equal(404);
      expect(response2.error).to.be.true;

      expect(response2).to.have.property("status");
      expect(response2).to.have.property("error");
      expect(response2).to.have.property("data");
      expect(response2).to.have.property("message");

      expect(response.status).to.equal(500);
      expect(response.error).to.be.true;
      expect(response).to.have.property("status");
      expect(response).to.have.property("error");
      expect(response).to.have.property("data");
      expect(response).to.have.property("message");
      expect(response.status).to.be.a("number");
      expect(response.error).to.be.a("boolean");
      expect(response.message).to.be.a("string");
    });
  });

  describe("Search Product By ID", () => {
    it("should return Searched products", async function () {
      this.timeout(10000);

      const response = await ProductService.searchProductByID(productId);

      expect(response.status).to.equal(200);
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

  describe("Search Product By Key", () => {
    it("should return Searched products which have common name or discription", async function () {
      this.timeout(10000);

      const data = {
        key: "Pen v12",
      };

      const response = await ProductService.searchProductByKey(data);

      expect(response.status).to.equal(200);
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

  describe("Search Product By unexisting ID", () => {
    it("should not return any products", async function () {
      this.timeout(10000);

      const response = await ProductService.searchProductByID(
        "29ufn1923213jj31093n"
      );

      expect(response.status).to.equal(500);
      expect(response.error).to.be.true;

      expect(response).to.have.property("status");
      expect(response).to.have.property("error");
      expect(response).to.have.property("data");
      expect(response).to.have.property("message");
      expect(response.status).to.be.a("number");
      expect(response.error).to.be.a("boolean");
      expect(response.message).to.be.a("string");
    });
  });

  describe("Update product", () => {
    it("Should update a products", async function () {
      this.timeout(10000);

      const data = {
        productName: "Pen updated",
        description: " description pen - 2 updated",
      };

      const response = await ProductService.updateProduct(productId, data);

      expect(response.status).to.equal(200);
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

  describe("Delete a product", () => {
    it("Should delete a products", async function () {
      this.timeout(10000);

      const response = await ProductService.updateProduct(productId);

      expect(response.status).to.equal(200);
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
});
