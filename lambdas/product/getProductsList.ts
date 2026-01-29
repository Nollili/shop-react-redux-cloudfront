import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export const getProductsList: APIGatewayProxyHandler = async (event) => {
  console.log('Lambda invoked', JSON.stringify(event));
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get all products
    const productsResult = await docClient.send(new ScanCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
    }));

    // Get all stock
    const stockResult = await docClient.send(new ScanCommand({
      TableName: process.env.STOCK_TABLE_NAME,
    }));

    // Create stock lookup map
    const stockMap = new Map();
    stockResult.Items?.forEach(stock => {
      stockMap.set(stock.product_id, stock.count);
    });

    // Join products with stock
    const products = productsResult.Items?.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      count: stockMap.get(product.id) || 0,
    })) || [];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(products),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};