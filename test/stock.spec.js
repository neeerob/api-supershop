const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const StockService = require('../lib/stockService/stockService')

chai.use(chaiHttp);
const expect = chai.expect;
let productId = null;
let stockId = null;

describe('Stock Service', () => {
    describe('Get All Stock', () => {
        it('Should return an array of stocks', async function() {
            this.timeout(15000); 
        
            const data = {
                page: 1,
                pageSize: 5,
            };
        
            const response = await StockService.getAllStocks(data);
            stockId = response.data[0]._id;
            productId = response.data[0].product_id;
            
            expect(response.status).to.equal(200);
            expect(response.error).to.be.false;
            expect(response.data).to.be.an('array');

            expect(response).to.have.property('status');
            expect(response).to.have.property('error');
            expect(response).to.have.property('data');
            expect(response).to.have.property('message');
            expect(response.status).to.be.a('number');
            expect(response.error).to.be.a('boolean');
            expect(response.message).to.be.a('string');
        });
    });

    describe('Search Stock By ID', () => {
        it('should return Searched stock', async function() {
            this.timeout(10000);

            const response = await StockService.searchStockByID(stockId);
       
            expect(response.status).to.equal(200);
            expect(response.error).to.be.false;

            expect(response).to.have.property('status');
            expect(response).to.have.property('error');
            expect(response).to.have.property('data');
            expect(response).to.have.property('message');
            expect(response.status).to.be.a('number');
            expect(response.error).to.be.a('boolean');
            expect(response.message).to.be.a('string');
        });
        
    });

    describe('Search Stock By product ID', () => {
        it(`should return Searched product's Stock`, async function() {
            this.timeout(10000);

            const response = await StockService.searchStockByProductID(productId);
       
            expect(response.status).to.equal(200);
            expect(response.error).to.be.false;

            expect(response).to.have.property('status');
            expect(response).to.have.property('error');
            expect(response).to.have.property('data');
            expect(response).to.have.property('message');
            expect(response.status).to.be.a('number');
            expect(response.error).to.be.a('boolean');
            expect(response.message).to.be.a('string');
        });
        
    });

    describe('Update stock quantity', () => {
        it('Should update a stock quantity', async function() {
            this.timeout(10000);

            const quantity = 100;

            const response = await StockService.updateStock(productId, quantity);
       
            expect(response.status).to.equal(200);
            expect(response.error).to.be.false;

            expect(response).to.have.property('status');
            expect(response).to.have.property('error');
            expect(response).to.have.property('data');
            expect(response).to.have.property('message');
            expect(response.status).to.be.a('number');
            expect(response.error).to.be.a('boolean');
        });
        
    });

});