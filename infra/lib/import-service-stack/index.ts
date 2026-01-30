import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

/**
 * ImportServiceStack - Manages CSV file import functionality
 * 
 * This stack provides a complete file import system:
 * 1. S3 bucket for storing uploaded CSV files
 * 2. API endpoint to generate signed URLs for file uploads
 * 3. Automatic processing of uploaded files via S3 events
 * 4. CSV parsing and logging for imported data
 * 
 * Workflow:
 * - Frontend calls GET /import?name=file.csv to get signed URL
 * - User uploads CSV directly to S3 using signed URL
 * - S3 triggers importFileParser Lambda when file is uploaded
 * - Lambda processes CSV and logs each record to CloudWatch
 */
export class ImportServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create S3 bucket for file imports - this will store uploaded CSV files
    const importBucket = new s3.Bucket(this, 'ImportBucket', {
      bucketName: 'import-service-bucket-' + this.account,
      // Allow public read access for signed URLs to work properly
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      // Configure CORS to allow uploads from frontend
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ['*'], // Allow all origins for development
          allowedHeaders: ['*'], // Allow all headers
          maxAge: 3000,
        },
      ],
    });

    // Lambda function that generates signed URLs for CSV file uploads
    // This function will be triggered by GET /import requests
    const importProductsFileFunction = new lambda.Function(this, 'ImportProductsFileFunction', {
      functionName: 'importProductsFile',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'importProductsFile.handler',
      // Lambda code will be in ../lambdas/import directory (relative to infra folder)
      code: lambda.Code.fromAsset('../lambdas/import'),
      environment: {
        // Pass bucket name to Lambda so it knows which bucket to create signed URLs for
        BUCKET_NAME: importBucket.bucketName,
      },
    });

    // Lambda function that processes uploaded CSV files
    // This function is triggered automatically when files are uploaded to S3
    const importFileParserFunction = new lambda.Function(this, 'ImportFileParserFunction', {
      functionName: 'importFileParser',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'importFileParser.handler',
      // Same code directory as importProductsFile
      code: lambda.Code.fromAsset('../lambdas/import'),
      environment: {
        // Pass bucket name for reference (though it's also in the S3 event)
        BUCKET_NAME: importBucket.bucketName,
      },
      // Increase timeout for processing large CSV files
      timeout: Duration.minutes(5),
    });

    // Configure S3 event trigger for importFileParser
    // This automatically triggers the Lambda when files are uploaded to uploaded/ folder
    importBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED, // Trigger on any object creation (PUT, POST, etc.)
      new s3n.LambdaDestination(importFileParserFunction), // Target: importFileParser Lambda
      {
        prefix: 'uploaded/', // Only trigger for files in uploaded/ folder
        suffix: '.csv', // Only trigger for CSV files
      }
    );

    // Grant Lambda function permissions to generate signed URLs for S3 bucket
    // This allows the function to create presigned URLs for file uploads
    importBucket.grantPut(importProductsFileFunction);
    importBucket.grantPutAcl(importProductsFileFunction);

    // Grant Lambda function permissions to read uploaded files
    // This allows importFileParser to read and process the uploaded CSV files
    importBucket.grantRead(importFileParserFunction);

    // Create API Gateway to expose the Lambda function via HTTP
    const api = new apigateway.RestApi(this, 'ImportServiceApi', {
      restApiName: 'Import Service API',
      description: 'API for importing product files',
      // Enable CORS for frontend integration
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Create /import resource path in API Gateway
    const importResource = api.root.addResource('import');
    
    // Add GET method to /import that triggers the Lambda function
    // This endpoint will accept fileName as query parameter and return signed URL
    importResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileFunction), {
      // Add request validation to ensure fileName query parameter is provided
      requestParameters: {
        'method.request.querystring.name': true,
      },
    });

    // Output the API Gateway URL for frontend integration
    new CfnOutput(this, 'ImportApiUrl', {
      value: api.url,
      description: 'Import Service API Gateway URL',
      exportName: 'ImportApiUrl',
    });

    // Output the S3 bucket name for reference
    new CfnOutput(this, 'ImportBucketName', {
      value: importBucket.bucketName,
      description: 'S3 bucket for file imports',
      exportName: 'ImportBucketName',
    });
  }
}