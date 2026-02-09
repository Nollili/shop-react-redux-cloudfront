import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * AuthorizationServiceStack - Manages authentication and authorization
 * 
 * This stack provides:
 * - basicAuthorizer Lambda for validating Basic Auth credentials
 * - Environment-based credential management via .env file
 */
export class AuthorizationServiceStack extends cdk.Stack {
  public readonly basicAuthorizerFunction: lambda.Function;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Load environment variables from .env file
    const envPath = path.join(__dirname, '../../../lambdas/authorization/.env');
    const envConfig = dotenv.config({ path: envPath });

    if (envConfig.error) {
      console.warn('Warning: .env file not found for authorization service');
    }

    // Lambda function for Basic Authentication
    this.basicAuthorizerFunction = new lambda.Function(this, 'BasicAuthorizerFunction', {
      functionName: 'basicAuthorizer',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'basicAuthorizer.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../lambdas/authorization')),
      environment: envConfig.parsed || {},
      description: 'Lambda authorizer for Basic Authentication',
    });

    // Output the Lambda ARN for use in other stacks
    new cdk.CfnOutput(this, 'BasicAuthorizerArn', {
      value: this.basicAuthorizerFunction.functionArn,
      description: 'ARN of the Basic Authorizer Lambda function',
      exportName: 'BasicAuthorizerArn',
    });
  }
}
