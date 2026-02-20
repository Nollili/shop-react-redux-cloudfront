import {
  aws_cloudfront,
  aws_cloudfront_origins,
  aws_s3,
  aws_s3_deployment,
  CfnOutput,
  RemovalPolicy,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Path to the built React application files
const path = './resources/build';

/**
 * DeploymentService - Manages frontend hosting infrastructure
 * 
 * This service creates the complete hosting setup for the React shop application:
 * - S3 bucket for storing static files (HTML, CSS, JS)
 * - CloudFront distribution for global content delivery
 * - Security headers including CSP for Unsplash images
 * - Automatic deployment and cache invalidation
 * 
 * The result is a globally distributed, secure, and fast-loading web application
 */
export class DeploymentService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // S3 bucket to store the built React application files
    // This bucket is private and only accessible through CloudFront
    const hostingBucket = new aws_s3.Bucket(this, 'FrontendBucket', {
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL, // Prevent direct public access
      removalPolicy: RemovalPolicy.DESTROY, // Delete bucket when stack is destroyed (dev only)
    });

    // CloudFront response headers policy for security
    // Adds Content Security Policy to allow Unsplash images while maintaining security
    const responseHeadersPolicy = new aws_cloudfront.ResponseHeadersPolicy(
      this,
      'SecurityHeadersPolicy',
      {
        securityHeadersBehavior: {
          contentSecurityPolicy: {
            // CSP policy: allow self-hosted content and Unsplash images
            contentSecurityPolicy: "default-src 'self'; img-src 'self' https://images.unsplash.com data:;",
            override: true, // Override any existing CSP headers
          },
        },
      }
    );

    // CloudFront distribution for global content delivery
    // Provides fast access to the React app from anywhere in the world
    const distribution = new aws_cloudfront.Distribution(
      this,
      'CloudfrontDistribution',
      {
        defaultBehavior: {
          // Origin: S3 bucket with Origin Access Control for security
          origin: aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(
            hostingBucket
          ),
          viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS, // Force HTTPS
          responseHeadersPolicy, // Apply security headers to all responses
        },
        defaultRootObject: 'index.html', // Serve index.html for root requests
        // SPA routing support: redirect 404s to index.html so React Router can handle them
        errorResponses: [
          {
            httpStatus: 404, // When CloudFront can't find a file
            responseHttpStatus: 200, // Return success status
            responsePagePath: '/index.html', // Serve the React app instead
          },
        ],
      }
    );

    // Automatic deployment: upload files from build folder to S3 and invalidate CloudFront cache
    // This runs every time the CDK stack is deployed
    new aws_s3_deployment.BucketDeployment(this, 'BucketDeployment', {
      sources: [aws_s3_deployment.Source.asset(path)], // Source: built React files
      destinationBucket: hostingBucket, // Target: S3 hosting bucket
      distribution, // CloudFront distribution to invalidate
      distributionPaths: ['/*'], // Invalidate all cached files
    });

    // Output the CloudFront URL for easy access
    // This is the public URL where users can access the shop
    new CfnOutput(this, 'CloudFrontURL', {
      value: distribution.domainName,
      description: 'The distribution URL - this is where users access the shop',
      exportName: 'CloudfrontURL',
    });

    // Output the S3 bucket name for reference
    // Useful for manual deployments or debugging
    new CfnOutput(this, 'BucketName', {
      value: hostingBucket.bucketName,
      description: 'The name of the S3 bucket hosting the frontend files',
      exportName: 'BucketName',
    });
  }
}