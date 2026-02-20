import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client for the current AWS region
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
// Create document client for easier JSON operations
const docClient = DynamoDBDocumentClient.from(client);

export const getProductsById: APIGatewayProxyHandler = async (event) => {
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
    // Extract productId from URL path parameters
    const productId = event.pathParameters?.productId;
    
    // Validate that productId was provided
    if (!productId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Product ID is required' }),
      };
    }

    // Fetch single product by ID from products table
    const productResult = await docClient.send(new GetCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Key: { id: productId }, // Use productId as primary key
    }));

    // Check if product exists
    if (!productResult.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    // Fetch stock information for this product
    const stockResult = await docClient.send(new GetCommand({
      TableName: process.env.STOCK_TABLE_NAME,
      Key: { product_id: productId }, // Use productId as foreign key
    }));

    // Join product with its stock information
    const product = {
      id: productResult.Item.id, // Product UUID
      title: productResult.Item.title, // Product name
      description: productResult.Item.description, // Product description
      price: productResult.Item.price, // Price in cents
      image: productResult.Item.image, // Image URL
      count: stockResult.Item?.count || 0, // Stock count (0 if no stock record)
    };

    // Return successful response with joined product data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (error) {
    // Log any errors that occur during database operations
    console.error('Error fetching product:', error);
    // Return error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};