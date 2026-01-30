"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = void 0;

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const createProduct = async (event) => {
  console.log('Lambda invoked', JSON.stringify(event));
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const productData = JSON.parse(event.body || '{}');
    
    if (!productData.title || !productData.price) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Title and price are required' }),
      };
    }

    const newProduct = {
      id: uuidv4(),
      title: productData.title,
      description: productData.description || '',
      price: productData.price,
      image: productData.image || '',
    };

    await docClient.send(new PutCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Item: newProduct,
    }));

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(newProduct),
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
exports.createProduct = createProduct;
