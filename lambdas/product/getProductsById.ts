import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export const getProductsById: APIGatewayProxyHandler = async (event) => {
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
    const productId = event.pathParameters?.productId;
    
    if (!productId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Product ID is required' }),
      };
    }

    // Get product
    const productResult = await docClient.send(new GetCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Key: { id: productId },
    }));

    if (!productResult.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    // Get stock
    const stockResult = await docClient.send(new GetCommand({
      TableName: process.env.STOCK_TABLE_NAME,
      Key: { product_id: productId },
    }));

    // Join product with stock
    const product = {
      id: productResult.Item.id,
      title: productResult.Item.title,
      description: productResult.Item.description,
      price: productResult.Item.price,
      image: productResult.Item.image,
      count: stockResult.Item?.count || 0,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};