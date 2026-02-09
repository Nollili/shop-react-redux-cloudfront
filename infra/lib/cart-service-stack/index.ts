import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

/**
 * CartServiceStack - Deploys NestJS Cart API as Lambda function
 * 
 * This stack provides:
 * - Lambda function running NestJS application
 * - API Gateway as HTTP endpoint
 * - CORS configuration for frontend integration
 */
export class CartServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function for NestJS Cart API
    const cartLambda = new lambda.Function(this, 'CartLambdaFunction', {
      functionName: 'cartService',
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('/Users/Noemi_Verebelyi/Desktop/nodejs-aws-cart-api'),
      handler: 'dist/lambda.handler',
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        NODE_ENV: 'production',
      },
    });

    // API Gateway for Cart Service
    const api = new apigateway.RestApi(this, 'CartServiceApi', {
      restApiName: 'Cart Service',
      description: 'API Gateway for NestJS Cart Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Integrate Lambda with API Gateway
    const cartIntegration = new apigateway.LambdaIntegration(cartLambda);

    // Add proxy resource to handle all routes
    const proxyResource = api.root.addProxy({
      defaultIntegration: cartIntegration,
      anyMethod: true,
    });

    // Output API Gateway URL
    new cdk.CfnOutput(this, 'CartApiUrl', {
      value: api.url,
      description: 'Cart Service API Gateway URL',
      exportName: 'CartApiUrl',
    });

    // Output Lambda ARN
    new cdk.CfnOutput(this, 'CartLambdaArn', {
      value: cartLambda.functionArn,
      description: 'Cart Service Lambda ARN',
      exportName: 'CartLambdaArn',
    });
  }
}
