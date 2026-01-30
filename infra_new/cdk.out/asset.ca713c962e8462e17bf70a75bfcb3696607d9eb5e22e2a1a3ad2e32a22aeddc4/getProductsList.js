"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsList = void 0;
// Mock product data
const products = [
    { id: '1', title: 'Classic White T-Shirt', price: 14.99, description: '100% cotton, unisex, available in all sizes' },
    { id: '2', title: 'Blue Denim Jeans', price: 39.99, description: 'Slim fit, stretchable, various waist sizes' },
    { id: '3', title: 'Red Hoodie', price: 29.99, description: 'Soft fleece, kangaroo pocket, drawstring hood' },
    { id: '4', title: 'Black Leather Jacket', price: 89.99, description: 'Genuine leather, biker style, limited edition' },
    { id: '5', title: 'Green Chino Shorts', price: 24.99, description: 'Lightweight, breathable, perfect for summer' },
];
const getProductsList = async (event) => {
    console.log('Lambda invoked', JSON.stringify(event));
    try {
        console.log('Fetching products:', products);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
            },
            body: JSON.stringify(products),
        };
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
            },
            body: JSON.stringify({ message: 'Internal Server Error', error: error instanceof Error ? error.message : String(error) }),
        };
    }
};
exports.getProductsList = getProductsList;
