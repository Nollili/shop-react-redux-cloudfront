import { getProductsList } from './getProductsList';
import { APIGatewayProxyEvent, Context, Callback, APIGatewayProxyResult } from 'aws-lambda';

describe('getProductsList Lambda', () => {
  it('returns a list of products with status 200', async () => {
    const event = { httpMethod: 'GET' } as unknown as APIGatewayProxyEvent;
    const context = {} as Context;
    const callback = (() => {}) as Callback<APIGatewayProxyResult>;
    const result = (await getProductsList(event, context, callback)) as APIGatewayProxyResult;
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('handles OPTIONS preflight', async () => {
    const event = { httpMethod: 'OPTIONS' } as unknown as APIGatewayProxyEvent;
    const context = {} as Context;
    const callback = (() => {}) as Callback<APIGatewayProxyResult>;
    const result = (await getProductsList(event, context, callback)) as APIGatewayProxyResult;
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe('');
  });
});
