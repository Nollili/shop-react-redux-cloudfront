import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Reference existing DynamoDB tables
    const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', 'products');
    const stockTable = dynamodb.Table.fromTableName(this, 'StockTable', 'stock');

    const createProductLambda = new lambda.Function(this, 'CreateProductLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'createProduct.createProduct',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../lambdas/product/dist')),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
      },
    });

    const getProductsListLambda = new lambda.Function(this, 'GetProductsListLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsList.getProductsList',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../lambdas/product/dist')),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
      },
    });

    const getProductsAvailableLambda = new lambda.Function(this, 'GetProductsAvailableLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsAvailable.getProductsAvailable',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../lambdas/product/dist')),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
      },
    });

    const getProductsByIdLambda = new lambda.Function(this, 'GetProductsByIdLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsById.getProductsById',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../lambdas/product/dist')),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
      },
    });

    // Grant DynamoDB permissions
    productsTable.grantWriteData(createProductLambda);
    productsTable.grantReadData(getProductsListLambda);
    stockTable.grantReadData(getProductsListLambda);
    productsTable.grantReadData(getProductsAvailableLambda);
    stockTable.grantReadData(getProductsAvailableLambda);
    productsTable.grantReadData(getProductsByIdLambda);
    stockTable.grantReadData(getProductsByIdLambda);

    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      restApiName: 'Product Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });

    const productResource = api.root.addResource('product', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });
    
    const productsResource = api.root.addResource('products', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });
    
    const availableResource = productResource.addResource('available', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });

    const productIdResource = productsResource.addResource('{productId}', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });

    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda));
    productsResource.addMethod('POST', new apigateway.LambdaIntegration(createProductLambda));
    availableResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsAvailableLambda));
    productIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdLambda));
  }
}
