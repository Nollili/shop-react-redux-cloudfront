# 🏗️ AWS Architecture Overview - E-Commerce Shop Application

## 📋 Complete System Summary

This project implements a serverless e-commerce shop using AWS services with a React frontend. The architecture follows modern cloud-native patterns with separate stacks for different concerns.

## 🎯 High-Level Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 USERS                                           │
└─────────────────────────┬───────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          CLOUDFRONT CDN                                         │
│                    (Global Content Delivery)                                    │
│                   d10nn90p9a4blu.cloudfront.net                                 │
└─────────────────────────┬───────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            S3 BUCKET                                            │
│                     (Static Website Hosting)                                    │
│            deploywebappstack-deploymentfrontendbucket...                        │
│                      [React App Files]                                          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY ENDPOINTS                                  │
├─────────────────────────┬───────────────────────┬───────────────────────────────┤
│    Product Service      │    Import Service     │      Future Services          │
└─────────┬───────────────┴───────────┬───────────┴───────────────────────────────┘
          │                           │
          ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐
│   LAMBDA FUNCTIONS  │    │   LAMBDA FUNCTIONS  │
│                     │    │                     │
│ • getProductsList   │    │ • importProductsFile│
│ • getProductsById   │    │ • importFileParser  │
│ • getProductsAvail  │    │                     │
│ • createProduct     │    │                     │
└─────────┬───────────┘    └─────────┬───────────┘
          │                          │
          ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐
│   DYNAMODB TABLES   │    │     S3 BUCKET       │
│                     │    │                     │
│ • products          │    │                     │
│ • stock             │    │                     │
└─────────────────────┘    └─────────────────────┘
```

---

## 🏢 AWS Stacks Breakdown

### 1. DeployWebAppStack 🌐

**Purpose:** Frontend hosting infrastructure  
// Creates global, secure, fast web hosting  
S3 Bucket (Private) → CloudFront Distribution → Global Users

**Components:**

- **S3 Bucket:**  
  Stores built React application files  
  Private bucket (no direct access)  
  Automatic deployment from `./resources/build`

- **CloudFront Distribution:**  
  `d10nn90p9a4blu.cloudfront.net`  
  Global CDN for fast content delivery  
  HTTPS enforcement  
  SPA routing support (404 → index.html)  
  CSP headers for Unsplash image security

*Why:* Provides fast, secure, globally distributed frontend hosting

---

## 2. DatabaseStack 📊

**Purpose:** Data persistence layer  
// Stores all application data  
Products Table ←→ Stock Table (via product_id foreign key)

**Components:**

- **Products Table:**
  - Name: `products`
  - Example:

```json
{
  "id": "uuid",           // Primary key
  "title": "string",      // Product name
  "description": "string", // Product details
  "price": "number",      // Price in cents
  "image": "string"       // Image URL
}
```

- **Stock Table:**
  - Name: `stock`
  - Example:

```json
{
  "product_id": "uuid",   // Foreign key to products.id
  "count": "number"       // Inventory quantity
}
```

*Why:* Separates product information from inventory for better data modeling

---

## 3. ProductServiceStack 🛍️

**Purpose:** Backend API for product operations  
// REST API for all product-related operations  
Frontend → API Gateway → Lambda Functions → DynamoDB

**API Endpoints:**

- `GET /products` → getProductsList → Returns all products with stock
- `POST /products` → createProduct → Creates new product + stock entry
- `GET /products/{id}` → getProductsById → Returns single product
- `GET /product/available` → getProductsAvailable → Returns available products

**Lambda Functions:**

- getProductsList: Scans both tables, performs in-memory join
- createProduct: Generates UUID, creates product + stock entries
- getProductsById: Fetches single product with stock info
- getProductsAvailable: Similar to getProductsList for different endpoint

*Why:* Provides complete CRUD operations for product management

---

## 4. ImportServiceStack 📁

**Purpose:** CSV file import system  
// Complete file import workflow  
Frontend → Signed URL → S3 Upload → Event Trigger → CSV Processing

**Components:**

- **S3 Bucket:**
  - Name: `import-service-bucket`
  - Stores uploaded CSV files in `uploaded/` folder
  - CORS configured for direct frontend uploads

- **importProductsFile Lambda:**
  - Generates signed URLs for secure file uploads
  - Triggered by `GET /import?name=filename.csv`
  - Returns presigned S3 URL for direct upload

- **importFileParser Lambda:**
  - Automatically triggered by S3 `ObjectCreated` events
  - Processes CSV files using `csv-parser` package
  - Logs each record to CloudWatch for visibility

**Event Flow:**

1. Frontend calls `GET /import?name=file.csv`
2. Lambda returns signed S3 URL
3. Frontend uploads file directly to S3
4. S3 triggers importFileParser Lambda
5. Lambda processes CSV and logs records

*Why:* Enables scalable file processing without server management

---

## 5. HelloS3Stack 🗑️

**Purpose:** Example/learning stack  
**Status:** Not connected to shop functionality

- Components: Simple S3 bucket (MyFirstBucket)
- Usage: Can be safely removed

---

## 🔄 Data Flow Diagrams

### Product Display Flow

```text
User visits shop page
        ↓
CloudFront serves React app
        ↓
React calls GET /product/available
        ↓
API Gateway → getProductsAvailable Lambda
        ↓
Lambda scans products + stock tables
        ↓
In-memory join on product_id
        ↓
Returns combined product + stock data
        ↓
React displays products with images
```

### Product Creation Flow

```text
User clicks "Create Product"
        ↓
Navigate to /admin/product-form
        ↓
User fills form (title, description, price, count, image)
        ↓
Submit → POST /products
        ↓
API Gateway → createProduct Lambda
        ↓
Lambda generates UUID
        ↓
Creates product entry in products table
        ↓
Creates stock entry in stock table
        ↓
Returns success → Shows success message
        ↓
Navigate back → Product appears in list
```

### CSV Import Flow

```text
User selects CSV file
        ↓
Frontend calls GET /import?name=file.csv
        ↓
importProductsFile Lambda returns signed URL
        ↓
Frontend uploads file directly to S3
        ↓
S3 ObjectCreated event triggers importFileParser
        ↓
Lambda reads CSV from S3
        ↓
Parses each row with csv-parser
        ↓
Logs records to CloudWatch
```

---

## 🔐 Security & Permissions

### IAM Permissions Matrix

| Lambda Function       | DynamoDB | S3 Read | S3 Write | CloudWatch |
|-----------------------|----------|---------|----------|------------|
| getProductsList       | Read     | -       | -        | Logs       |
| createProduct         | Write    | -       | -        | Logs       |
| getProductsById       | Read     | -       | -        | Logs       |
| getProductsAvailable  | Read     | -       | -        | Logs       |
| importProductsFile    | -        | -       | Write    | Logs       |
| importFileParser      | -        | Read    | -        | Logs       |

---

### CORS Configuration

- **API Gateway:** Allows all origins, methods, headers
- **S3 Import Bucket:** Configured for direct frontend uploads
- **CloudFront:** CSP headers allow Unsplash images

---

## 💰 Cost Optimization

### Serverless Benefits

- Pay-per-use: Only charged for actual requests/storage
- Auto-scaling: Handles traffic spikes automatically
- No server management: AWS handles infrastructure

### DynamoDB Configuration

- On-demand billing: Pay only for read/write operations
- No provisioned capacity: Scales automatically

### S3 Configuration

- Standard storage: For frequently accessed files
- Lifecycle policies: Could be added for cost optimization

---

## 🚀 Deployment Strategy

### Infrastructure as Code

- **CDK TypeScript:** All infrastructure defined in code
- **Version controlled:** Infrastructure changes tracked in Git
- **Reproducible:** Can deploy to multiple environments

### Deployment Commands

```bash
# Deploy all stacks
cd infra && npm run cdk deploy --all

# Deploy specific stack
npm run cdk deploy ProductServiceStack

# Deploy frontend
npm run build && aws s3 sync dist/ s3://bucket-name
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

---

## 📈 Monitoring & Observability

### CloudWatch Integration

- **Lambda Logs:** All function executions logged
- **API Gateway Logs:** Request/response tracking
- **Error Monitoring:** Automatic error capture

### Key Metrics

- API response times
- Lambda execution duration
- DynamoDB read/write capacity
- S3 upload success rates

---

## 🔮 Future Enhancements

### Potential Additions

- User Authentication: Cognito integration
- Order Management: Shopping cart and checkout
- Payment Processing: Stripe/PayPal integration
- Image Processing: Automatic image optimization
- Search Functionality: ElasticSearch integration
- Caching Layer: ElastiCache for performance

### Scalability Considerations

- **Database:** Could migrate to Aurora for complex queries
- **CDN:** Already globally distributed via CloudFront
- **Compute:** Lambda automatically scales to demand
- **Storage:** S3 provides unlimited scalability

---

This architecture provides a production-ready, scalable, and cost-effective e-commerce platform using modern AWS serverless technologies. The separation of concerns across different stacks enables independent development, deployment, and scaling of different system components.

