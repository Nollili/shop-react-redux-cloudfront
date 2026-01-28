import { APIGatewayProxyHandler } from 'aws-lambda';
import { products } from './products';

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

    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

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