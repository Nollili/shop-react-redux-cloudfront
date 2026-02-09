# Authorization Service

## Overview

The Authorization Service provides Basic Authentication for API Gateway endpoints using a Lambda authorizer.

## Architecture

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  API Request    │───▶│ basicAuthorizer  │───▶│  IAM Policy     │
│  + Basic Auth   │    │     Lambda       │    │ (Allow/Deny)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### Lambda Function: basicAuthorizer

- **Runtime**: Node.js 20.x
- **Handler**: basicAuthorizer.handler
- **Purpose**: Validates Basic Auth credentials and returns IAM policy

### Environment Variables

Credentials are stored as environment variables loaded from `.env` file:

```env
Noemi_Verebelyi=TEST_PASSWORD
```

## Authentication Flow

1. **Request arrives** with `Authorization: Basic <base64(username:password)>` header
2. **Lambda decodes** the Base64 credentials
3. **Lambda validates** credentials against environment variables
4. **Lambda returns** IAM policy:
   - **Allow**: Valid credentials → 200 OK
   - **Deny**: Invalid credentials → 403 Forbidden
   - **Error**: Missing header → 401 Unauthorized

## Response Format

### Success (Valid Credentials)

```json
{
  "principalId": "Noemi_Verebelyi",
  "policyDocument": {
    "Version": "2012-10-17",
    "Statement": [{
      "Action": "execute-api:Invoke",
      "Effect": "Allow",
      "Resource": "arn:aws:execute-api:*:*:*/GET/import"
    }]
  }
}
```

### Failure (Invalid Credentials)

```json
{
  "principalId": "username",
  "policyDocument": {
    "Version": "2012-10-17",
    "Statement": [{
      "Action": "execute-api:Invoke",
      "Effect": "Deny",
      "Resource": "arn:aws:execute-api:*:*:*/GET/import"
    }]
  }
}
```

### Error (Missing Authorization)

```text
Throws: "Unauthorized" error → 401 status
```

## Testing

### Valid Credentials

```bash
# Base64 encode: Noemi_Verebelyi:TEST_PASSWORD
echo -n "Noemi_Verebelyi:TEST_PASSWORD" | base64
# Result: Tm9lbWlfVmVyZWJlbHlpOlRFU1RfUEFTU1dPUkQ=

# Test with curl
curl -H "Authorization: Basic Tm9lbWlfVmVyZWJlbHlpOlRFU1RfUEFTU1dPUkQ=" \
  https://api-gateway-url/import
```

### Invalid Credentials

```bash
# Returns 403 Forbidden
curl -H "Authorization: Basic aW52YWxpZDppbnZhbGlk" \
  https://api-gateway-url/import
```

### Missing Authorization

```bash
# Returns 401 Unauthorized
curl https://api-gateway-url/import
```

## Security Notes

- ✅ Credentials stored in `.env` file (not committed to Git)
- ✅ `.env` added to `.gitignore`
- ✅ Environment variables loaded at deployment time
- ✅ Basic Auth over HTTPS only
- ⚠️ For production, consider using AWS Secrets Manager or Parameter Store

## Deployment

```bash
cd infra
npx cdk deploy AuthorizationServiceStack
```

## Integration with API Gateway

The basicAuthorizer is integrated with the Import Service API Gateway:

```typescript
const authorizer = new apigateway.TokenAuthorizer(this, 'ImportAuthorizer', {
  handler: basicAuthorizerFunction,
  identitySource: 'method.request.header.Authorization',
});

importResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileFunction), {
  authorizer: authorizer,
  requestParameters: {
    'method.request.querystring.name': true,
  },
});
```

### Testing the Protected Endpoint

```bash
# Without authorization - Returns 401
curl "https://api-url/import?name=test.csv"

# With valid credentials - Returns 200 with signed URL
curl -H "Authorization: Basic Tm9lbWlfVmVyZWJlbHlpOlRFU1RfUEFTU1dPUkQ=" \
  "https://api-url/import?name=test.csv"

# With invalid credentials - Returns 403
curl -H "Authorization: Basic aW52YWxpZDppbnZhbGlk" \
  "https://api-url/import?name=test.csv"
```

## Stack Outputs

- **BasicAuthorizerArn**: ARN of the Lambda function for use in API Gateway authorizers
