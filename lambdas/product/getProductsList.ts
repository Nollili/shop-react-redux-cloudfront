import { APIGatewayProxyHandler } from 'aws-lambda';
import { products } from './products';

// Lambda handler for GET /products endpoint
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
    console.log('Fetching products:', products);
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
      body: JSON.stringify({ message: 'Internal Server Error', error: error instanceof Error ? error.message : String(error) }),
    };
  }
};
