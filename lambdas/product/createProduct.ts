import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Initialize DynamoDB client for the current AWS region
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
// Create document client for easier JSON operations
const docClient = DynamoDBDocumentClient.from(client);

export const createProduct: APIGatewayProxyHandler = async (event) => {
  // Log the incoming API Gateway event for debugging
  console.log('Lambda invoked', JSON.stringify(event));
  
  // Define CORS headers for cross-origin requests
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Allow requests from any domain
    'Access-Control-Allow-Headers': '*', // Allow any headers
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST and OPTIONS methods
  };

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Parse the request body to get product data
    const productData = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!productData.title || !productData.price) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Title and price are required' }),
      };
    }

    // Create new product with generated UUID
    const newProduct = {
      id: uuidv4(), // Generate unique product ID
      title: productData.title, // Product name
      description: productData.description || '', // Product description (optional)
      price: productData.price, // Price in cents
      image: productData.image || '', // Image URL (optional)
    };

    // Save the new product to DynamoDB products table
    await docClient.send(new PutCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Item: newProduct,
    }));

    // Return successful response with created product data
    return {
      statusCode: 201, // Created status code
      headers,
      body: JSON.stringify(newProduct),
    };
  } catch (error) {
    // Log any errors that occur during database operations
    console.error('Error creating product:', error);
    // Return error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};