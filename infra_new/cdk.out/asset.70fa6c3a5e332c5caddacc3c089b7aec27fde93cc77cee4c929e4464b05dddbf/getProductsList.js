"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsList = void 0;
// Mock product data
const products = [
    { id: '1', title: 'Product 1', price: 10.99, description: 'First product' },
    { id: '2', title: 'Product 2', price: 19.99, description: 'Second product' },
    { id: '3', title: 'Product 3', price: 5.99, description: 'Third product' },
];
const getProductsList = async () => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify(products),
    };
};
exports.getProductsList = getProductsList;
