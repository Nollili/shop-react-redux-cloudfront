import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

/**
 * ProductServiceStack - Creates the backend API for product management
 * 
 * This stack provides REST API endpoints for the e-commerce shop:
 * - GET /products - List all products with stock information
 * - POST /products - Create new products
 * - GET /products/{id} - Get single product by ID
 * - GET /product/available - Get products with availability info
 * 
 * Each endpoint is backed by Lambda functions that interact with DynamoDB tables
 */
export class ProductServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Reference existing DynamoDB tables created by DatabaseStack
    // These tables must exist before this stack is deployed
    const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', 'products');
    const stockTable = dynamodb.Table.fromTableName(this, 'StockTable', 'stock');

    // Lambda function for creating new products
    // Handles POST /products requests to add new items to the catalog
    const createProductLambda = new lambda.Function(this, 'CreateProductLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'createProduct.createProduct', // Function: createProduct in createProduct.js
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../lambdas/product/dist')),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
      },
    });

    // Lambda function for listing all products
    // Handles GET /products - joins products and stock data
    const getProductsListLambda = new lambda.Function(this, 'GetProductsListLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsList.getProductsList', // Function: getProductsList in getProductsList.js
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../lambdas/product/dist')),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
      },
    });

    // Lambda function for getting available products
    // Handles GET /product/available - similar to getProductsList but different endpoint
    const getProductsAvailableLambda = new lambda.Function(this, 'GetProductsAvailableLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsAvailable.getProductsAvailable', // Function: getProductsAvailable in getProductsAvailable.js
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../lambdas/product/dist')),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
      },
    });

    // Lambda function for getting single product by ID
    // Handles GET /products/{id} - returns specific product with stock info
    const getProductsByIdLambda = new lambda.Function(this, 'GetProductsByIdLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsById.getProductsById', // Function: getProductsById in getProductsById.js
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../lambdas/product/dist')),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
      },
    });

    // Grant DynamoDB permissions to Lambda functions
    // Each function gets only the minimum permissions it needs
    productsTable.grantWriteData(createProductLambda); // Create products needs write access
    productsTable.grantReadData(getProductsListLambda); // Read-only access for listing
    stockTable.grantReadData(getProductsListLambda); // Read stock data for joins
    productsTable.grantReadData(getProductsAvailableLambda); // Read-only access
    stockTable.grantReadData(getProductsAvailableLambda); // Read stock data for joins
    productsTable.grantReadData(getProductsByIdLambda); // Read-only access
    stockTable.grantReadData(getProductsByIdLambda); // Read stock data for joins

    // Create API Gateway to expose Lambda functions as REST endpoints
    // This creates the public API that the frontend calls
    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      restApiName: 'Product Service',
      description: 'REST API for product management operations',
      // Enable CORS for all endpoints to allow frontend access
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // Allow requests from any domain
        allowMethods: apigateway.Cors.ALL_METHODS, // Allow GET, POST, PUT, DELETE, etc.
        allowHeaders: ['*'], // Allow any headers (Content-Type, Authorization, etc.)
      },
    });

    // Create API resource: /product
    // Used for product-related operations
    const productResource = api.root.addResource('product', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });
    
    // Create API resource: /products
    // Used for products collection operations
    const productsResource = api.root.addResource('products', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });
    
    // Create API resource: /product/available
    // Nested resource for available products endpoint
    const availableResource = productResource.addResource('available', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });

    // Create API resource: /products/{productId}
    // Dynamic resource for single product operations
    const productIdResource = productsResource.addResource('{productId}', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });

    // Wire up HTTP methods to Lambda functions
    // These create the actual API endpoints that the frontend calls
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda)); // GET /products
    productsResource.addMethod('POST', new apigateway.LambdaIntegration(createProductLambda)); // POST /products
    availableResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsAvailableLambda)); // GET /product/available
    productIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdLambda)); // GET /products/{id}
  }
}
