import { getProductsById } from './getProductsById';
import { APIGatewayProxyEvent, Context, Callback, APIGatewayProxyResult } from 'aws-lambda';

describe('getProductsById Lambda', () => {
  it('returns a product by id with status 200', async () => {
    const event = { httpMethod: 'GET', pathParameters: { productId: '1' } } as unknown as APIGatewayProxyEvent;
    const context = {} as Context;
    const callback = (() => {}) as Callback<APIGatewayProxyResult>;
    const result = (await getProductsById(event, context, callback)) as APIGatewayProxyResult;
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.id).toBe('1');
  });

  it('returns 404 if product not found', async () => {
    const event = { httpMethod: 'GET', pathParameters: { productId: '999' } } as unknown as APIGatewayProxyEvent;
    const context = {} as Context;
    const callback = (() => {}) as Callback<APIGatewayProxyResult>;
    const result = (await getProductsById(event, context, callback)) as APIGatewayProxyResult;
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Product not found');
  });

  it('returns 400 if productId is missing', async () => {
    const event = { httpMethod: 'GET', pathParameters: {} } as unknown as APIGatewayProxyEvent;
    const context = {} as Context;
    const callback = (() => {}) as Callback<APIGatewayProxyResult>;
    const result = (await getProductsById(event, context, callback)) as APIGatewayProxyResult;
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('Product ID is required');
  });

  it('handles OPTIONS preflight', async () => {
    const event = { httpMethod: 'OPTIONS' } as unknown as APIGatewayProxyEvent;
    const context = {} as Context;
    const callback = (() => {}) as Callback<APIGatewayProxyResult>;
    const result = (await getProductsById(event, context, callback)) as APIGatewayProxyResult;
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe('');
  });
});
