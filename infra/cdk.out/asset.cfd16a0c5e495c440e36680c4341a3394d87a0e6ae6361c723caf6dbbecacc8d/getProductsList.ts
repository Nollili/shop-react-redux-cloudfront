import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client for the current AWS region
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
// Create document client for easier JSON operations
const docClient = DynamoDBDocumentClient.from(client);

export const getProductsList: APIGatewayProxyHandler = async (event) => {
  // Log the incoming API Gateway event for debugging
  console.log('Lambda invoked', JSON.stringify(event));
  
  // Define CORS headers for cross-origin requests
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Allow requests from any domain
    'Access-Control-Allow-Headers': '*', // Allow any headers
    'Access-Control-Allow-Methods': 'GET, OPTIONS', // Allow GET and OPTIONS methods
  };

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Fetch all products from the products table
    const productsResult = await docClient.send(new ScanCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
    }));

    // Fetch all stock records from the stock table
    const stockResult = await docClient.send(new ScanCommand({
      TableName: process.env.STOCK_TABLE_NAME,
    }));

    // Create a Map for fast stock lookups by product_id
    const stockMap = new Map();
    stockResult.Items?.forEach(stock => {
      // Map each product_id to its stock count
      stockMap.set(stock.product_id, stock.count);
    });

    // Join products with their stock counts
    const products = productsResult.Items?.map(product => ({
      id: product.id, // Product UUID
      title: product.title, // Product name
      description: product.description, // Product description
      price: product.price, // Price in cents
      image: product.image, // Image URL
      count: stockMap.get(product.id) || 0, // Stock count (0 if not found)
    })) || [];

    // Return successful response with joined product data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(products),
    };
  } catch (error) {
    // Log any errors that occur during database operations
    console.error('Error fetching products:', error);
    // Return error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};