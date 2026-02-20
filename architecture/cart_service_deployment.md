# Cart Service Deployment

## Overview

Successfully cloned and deployed the NestJS Cart Service as an AWS Lambda function with API Gateway integration.

## Steps Completed

### 1. Clone Repository
```bash
git clone https://github.com/rolling-scopes-school/nodejs-aws-cart-api.git
cd nodejs-aws-cart-api
npm install
npm run build
```

### 2. Create Lambda Handler

Created `src/lambda.ts` to wrap NestJS app for Lambda:
```typescript
const serverlessExpress = require('@vendia/serverless-express');

async function bootstrapServer() {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    nestApp.enableCors();
    await nestApp.init();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}

export const handler = async (event, context) => {
  const server = await bootstrapServer();
  return server(event, context);
};
```

### 3. Install Dependencies
```bash
npm install @vendia/serverless-express aws-lambda @types/aws-lambda --save
```

### 4. Create CDK Stack

Created `infra/lib/cart-service-stack/index.ts`:
```typescript
const cartLambda = new lambda.Function(this, 'CartLambdaFunction', {
  functionName: 'cartService',
  runtime: lambda.Runtime.NODEJS_20_X,
  code: lambda.Code.fromAsset('/path/to/nodejs-aws-cart-api'),
  handler: 'dist/lambda.handler',
  timeout: cdk.Duration.seconds(30),
  memorySize: 512,
});

const api = new apigateway.RestApi(this, 'CartServiceApi', {
  restApiName: 'Cart Service',
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: ['Content-Type', 'Authorization'],
  },
});

const proxyResource = api.root.addProxy({
  defaultIntegration: new apigateway.LambdaIntegration(cartLambda),
  anyMethod: true,
});
```

### 5. Deploy to AWS
```bash
cd infra
npx cdk deploy CartServiceStack --require-approval never
```

## Deployment Results

✅ **Lambda Function**: `cartService`  
✅ **API Gateway URL**: `https://6i9mvotf43.execute-api.eu-central-1.amazonaws.com/prod/`  
✅ **Lambda ARN**: `arn:aws:lambda:eu-central-1:811890958170:function:cartService`

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  HTTP Request   │───▶│  API Gateway     │───▶│ Lambda Function │
│                 │    │  (Proxy+)        │    │  (NestJS App)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## API Gateway Configuration

- **Proxy Resource**: `{proxy+}` - Forwards all paths to Lambda
- **Methods**: ANY - Supports all HTTP methods (GET, POST, PUT, DELETE, etc.)
- **CORS**: Enabled for all origins
- **Integration**: Lambda Proxy Integration

## Lambda Configuration

- **Runtime**: Node.js 20.x
- **Memory**: 512 MB
- **Timeout**: 30 seconds
- **Handler**: `dist/lambda.handler`
- **Code**: Entire nodejs-aws-cart-api directory (dist + node_modules)

## NestJS Cart API Features

- **Authentication**: JWT and Basic Auth support
- **Cart Management**: Create, read, update cart items
- **Order Processing**: Checkout and order creation
- **User Management**: User registration and login

## Next Steps

1. **Test Endpoints**:
   ```bash
   # Health check
   curl https://6i9mvotf43.execute-api.eu-central-1.amazonaws.com/prod/api
   
   # Register user
   curl -X POST https://6i9mvotf43.execute-api.eu-central-1.amazonaws.com/prod/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"testuser","password":"TEST_PASSWORD"}'
   ```

2. **Add Database**: Configure DynamoDB or RDS for persistent storage

3. **Add Authorization**: Integrate with basicAuthorizer for protected endpoints

4. **Environment Variables**: Add configuration for database connections, JWT secrets, etc.

## Troubleshooting

### Issue: Internal Server Error (500)
- **Cause**: Runtime initialization issues with serverless-express
- **Solution**: Verify lambda.ts import statements and rebuild

### Issue: Module not found
- **Cause**: Missing dependencies in Lambda package
- **Solution**: Ensure node_modules is included in deployment package

### Issue: Timeout
- **Cause**: Cold start or slow initialization
- **Solution**: Increase Lambda timeout or implement provisioned concurrency

## Files Created

- `/Users/Noemi_Verebelyi/Desktop/nodejs-aws-cart-api/src/lambda.ts`
- `/Users/Noemi_Verebelyi/Desktop/shop-react-redux-cloudfront/infra/lib/cart-service-stack/index.ts`

## CDK Commands

```bash
# Deploy
npx cdk deploy CartServiceStack

# View diff
npx cdk diff CartServiceStack

# Destroy
npx cdk destroy CartServiceStack
```

## Summary

Successfully deployed NestJS Cart Service to AWS Lambda with API Gateway. The service is accessible via HTTPS endpoint and supports all HTTP methods through proxy integration. Further configuration needed for database connectivity and authentication integration.
