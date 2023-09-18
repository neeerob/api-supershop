const chai = require("chai");
const chaiHttp = require("chai-http");
// const app = require('../server');
const SaleService = require("../lib/salesService/salesService");
const ReceiptService = require("../lib/receiptService/seceiptService");

chai.use(chaiHttp);
const expect = chai.expect;
let receiptNumber = null;
let toDeleteReceipt = null;

describe("Receipt Service", () => {
  describe("Get Receipt By Date", () => {
    it("Should return an array of Receipt", async function () {
      this.timeout(15000);

      const data = {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      };

      const response = await ReceiptService.getReceiptByDate(data);

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

  describe("All receipt", () => {
    it("Should return an array of all Receipt", async function () {
      this.timeout(15000);

      const data = {
        page: 1,
        pageSize: 5,
      };

      const response = await ReceiptService.getAll(data);
      receiptNumber = response.data[1]._id;

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

  describe("Get receipt by ID", () => {
    it("Should return a Receipt", async function () {
      this.timeout(15000);

      const data = receiptNumber;

      const response = await ReceiptService.returnByReceiptNumber(
        "SCPT16940003672266927"
      );

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

  describe("Get receipt by unexisting ID", () => {
    it("Should not return any Receipt", async function () {
      this.timeout(15000);
      const response = await ReceiptService.returnByReceiptNumber(
        "k123nsknvk12jnfpe"
      );

      expect(response.status).to.equal(404);
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

  describe("Create a receipt", () => {
    it("Should create a receipt", async function () {
      this.timeout(15000);

      const data = [
        {
          saleId: "64f855ca2bebcdba30e2c64b",
        },
        {
          saleId: "64f855ab2bebcdba30e2c646",
        },
        {
          saleId: "64f854a3c221c419f13612dc",
        },
      ];

      const response = await ReceiptService.createReceipt(data);
      toDeleteReceipt = response.data.receiptNumber;

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

  describe("Return/delete a receipt", () => {
    it("Should delete a receipt", async function () {
      this.timeout(15000);
      const response = await ReceiptService.returnReceipt(toDeleteReceipt);

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
