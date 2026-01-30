import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';

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

    // Grant Lambda function permissions to generate signed URLs for S3 bucket
    // This allows the function to create presigned URLs for file uploads
    importBucket.grantPut(importProductsFileFunction);
    importBucket.grantPutAcl(importProductsFileFunction);

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