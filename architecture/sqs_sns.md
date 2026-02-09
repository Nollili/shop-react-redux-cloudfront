# SQS + SNS Integration Architecture

## Overview

The system processes CSV product imports through a decoupled, event-driven architecture using SQS for reliable message processing and SNS for notifications.

## Architecture Flow

CSV Upload → S3 → Lambda Parser → SQS Queue → Batch Processor → DynamoDB + SNS

## Detailed Component Diagram

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CSV File      │───▶│   S3 Bucket      │───▶│ importFileParser│
│   (clothing)    │    │ (upload trigger) │    │    Lambda       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Email Inbox     │◀───│   SNS Topic      │◀───│  SQS Queue      │
│ (notifications) │    │(createProduct    │    │(catalogItems    │
└─────────────────┘    │     Topic)       │    │    Queue)       │
                       └──────────────────┘    └─────────────────┘
                                ▲                        │
                                │                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   DynamoDB      │◀───│catalogBatchProcess│◀───│ SQS Event Source│
│ (products+stock)│    │     Lambda        │    │ (batch: 5 msgs) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Why This Architecture?

### SQS Benefits

- Decoupling: Parser and processor run independently
- Reliability: Messages persist until successfully processed
- Scalability: Automatic scaling based on queue depth
- Batch Processing: Process up to 5 records efficiently
- Error Handling: Dead Letter Queue for failed messages

### SNS Benefits

- Fan-out: Single message to multiple subscribers
- Reliability: Guaranteed delivery with retries
- Flexibility: Easy to add more notification channels
- Asynchronous: Non-blocking notifications

## Message Flow Details

### 1. CSV Processing

// importFileParser.js
csvRecord → JSON.stringify() → SQS.sendMessage()

### 2. SQS Batching

SQS Configuration:

- batchSize: 5 messages
- maxBatchingWindow: 10 seconds
- visibilityTimeout: 5 minutes
- retries: 3 attempts → DLQ

### 3. Product Creation + Notification

// catalogBatchProcess.js
for each SQS record:

  1. Parse product data
  2. Create product in DynamoDB
  3. Create stock entry
  4. Collect created products

if (createdProducts.length > 0):

  SNS.publish({
    Subject: "X New Product(s) Created",
    Message: JSON.stringify(productDetails)
  })

### Error Handling Strategy

```text
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Processing  │───▶│   Retry     │───▶│ Dead Letter │
│   Fails     │    │ (3 times)   │    │   Queue     │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Key Configuration

| Component           | Setting              | Purpose                   |
|---------------------|---------------------|---------------------------|
| SQS Batch Size      | 5 messages          | Efficient processing      |
| Visibility Timeout  | 5 minutes           | Processing time buffer    |
| Message Retention   | 14 days             | Long-term reliability     |
| SNS Email           | Pending confirmation| Manual subscription step  |

## Benefits of This Design

- Fault Tolerance: Failed messages retry automatically
- Performance: Batch processing reduces Lambda invocations
- Monitoring: SNS provides immediate feedback on imports
- Scalability: Each component scales independently
- Maintainability: Clear separation of concerns

The architecture ensures reliable, scalable product imports with real-time notifications while maintaining system resilience through proper error handling and message persistence.

---

## S3 Event Trigger Configuration

The S3 Event Notification is what triggers the importFileParser Lambda function. Here's the specific configuration:

```typescript
// Configure S3 event trigger for importFileParser
importBucket.addEventNotification(
  s3.EventType.OBJECT_CREATED, // Trigger on any object creation (PUT, POST, etc.)
  new s3n.LambdaDestination(importFileParserFunction), // Target: importFileParser Lambda
  {
    prefix: 'uploaded/', // Only trigger for files in uploaded/ folder
    suffix: '.csv', // Only trigger for CSV files
  }
);
```

### What Triggers the Lambda

| Trigger Condition   | Value               | Purpose                                |
|---------------------|---------------------|----------------------------------------|
| Event Type          | OBJECT_CREATED      | Any file upload (PUT, POST, multipart) |
| Prefix Filter       | uploaded/           | Only files in the uploaded/ folder     |
| Suffix Filter       | .csv                | Only CSV files                         |

### Complete Trigger Flow

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ File Upload     │───▶│ S3 Event Filter  │───▶│ importFileParser│
│ to S3 Bucket    │    │ uploaded/*.csv   │    │    Lambda       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Example Trigger Scenarios

✅ **TRIGGERS Lambda:**

- s3://bucket/uploaded/products.csv
- s3://bucket/uploaded/clothing-items.csv
- s3://bucket/uploaded/test-sns.csv

❌ **DOES NOT trigger Lambda:**

- s3://bucket/products.csv (wrong folder)
- s3://bucket/uploaded/products.txt (wrong file type)
- s3://bucket/parsed/products.csv (wrong folder)

### S3 Event Details

When triggered, the Lambda receives an S3 event with:

```json
{
  "Records": [{
    "s3": {
      "bucket": { "name": "import-service-bucket-811890958170" },
      "object": { "key": "uploaded/clothing-items.csv" }
    }
  }]
}
```

This automatic event-driven architecture ensures that any CSV file uploaded to the uploaded/ folder immediately triggers processing without manual intervention.
