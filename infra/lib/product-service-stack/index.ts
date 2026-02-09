import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
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
 * Additionally provides SQS-based batch processing for CSV imports:
 * - SQS Queue: catalogItemsQueue for receiving product data
 * - Lambda: catalogBatchProcess for processing batches of products
 * - Dead Letter Queue: For handling failed message processing
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

    // SNS topic for product creation notifications
    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
      topicName: 'createProductTopic',
      displayName: 'Product Creation Notifications',
    });

    // Email subscription for product creation notifications
    createProductTopic.addSubscription(
      new snsSubscriptions.EmailSubscription('noemilili@gmail.com')
    );

    // SQS queue for batch processing CSV product data
    // This queue receives product records from CSV parsing and triggers batch processing
    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      queueName: 'catalogItemsQueue',
      // Configure message retention and visibility timeout for reliable processing
      retentionPeriod: cdk.Duration.days(14), // Keep messages for 14 days
      visibilityTimeout: cdk.Duration.minutes(5), // Hide messages for 5 minutes during processing
      // Dead letter queue configuration for failed messages
      deadLetterQueue: {
        maxReceiveCount: 3, // Retry failed messages 3 times before moving to DLQ
        queue: new sqs.Queue(this, 'CatalogItemsDeadLetterQueue', {
          queueName: 'catalogItemsQueue-dlq',
        }),
      },
    });

    // Lambda function for batch processing products from SQS messages
    // Processes CSV product data in batches to create products in DynamoDB
    const catalogBatchProcessLambda = new lambda.Function(this, 'CatalogBatchProcessLambda', {
      functionName: 'catalogBatchProcess',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'catalogBatchProcess.catalogBatchProcess', // Function: catalogBatchProcess in catalogBatchProcess.js
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../lambdas/product')), // Use source files directly
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
        SNS_TOPIC_ARN: createProductTopic.topicArn,
      },
      // Increase timeout for batch processing operations
      timeout: cdk.Duration.minutes(5),
    });

    // Configure SQS event source to trigger Lambda function
    // Processes up to 5 messages at once for efficient batch operations
    catalogBatchProcessLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
        batchSize: 5, // Process up to 5 SQS messages in a single Lambda invocation
        maxBatchingWindow: cdk.Duration.seconds(10), // Wait up to 10 seconds to collect messages
      })
    );

    // Grant DynamoDB permissions to Lambda functions
    // Each function gets only the minimum permissions it needs
    productsTable.grantWriteData(createProductLambda); // Create products needs write access
    productsTable.grantReadData(getProductsListLambda); // Read-only access for listing
    stockTable.grantReadData(getProductsListLambda); // Read stock data for joins
    productsTable.grantReadData(getProductsAvailableLambda); // Read-only access
    stockTable.grantReadData(getProductsAvailableLambda); // Read stock data for joins
    productsTable.grantReadData(getProductsByIdLambda); // Read-only access
    stockTable.grantReadData(getProductsByIdLambda); // Read stock data for joins
    
    // Grant permissions for batch processing Lambda
    productsTable.grantWriteData(catalogBatchProcessLambda); // Write access to create products
    stockTable.grantWriteData(catalogBatchProcessLambda); // Write access to create stock entries
    createProductTopic.grantPublish(catalogBatchProcessLambda); // Allow publishing to SNS topic

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

    // Output the SQS queue URL for integration with other services
    new cdk.CfnOutput(this, 'CatalogItemsQueueUrl', {
      value: catalogItemsQueue.queueUrl,
      description: 'SQS queue URL for batch processing product data',
      exportName: 'CatalogItemsQueueUrl',
    });

    // Output the SQS queue ARN for cross-stack references
    new cdk.CfnOutput(this, 'CatalogItemsQueueArn', {
      value: catalogItemsQueue.queueArn,
      description: 'SQS queue ARN for batch processing product data',
      exportName: 'CatalogItemsQueueArn',
    });
  }
}
