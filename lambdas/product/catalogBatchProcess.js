const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { randomUUID } = require('crypto');

// Initialize DynamoDB client for database operations
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Initialize SNS client for notifications
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

/**
 * catalogBatchProcess - Processes SQS messages to create products in batch
 * 
 * This function is triggered by SQS events containing product data from CSV processing.
 * It receives up to 5 messages at once and creates corresponding products in DynamoDB.
 * 
 * Trigger: SQS catalogItemsQueue with batchSize: 5
 * Input: SQS event with product records from CSV parsing
 * Output: Creates products in DynamoDB products and stock tables
 */
exports.catalogBatchProcess = async (event) => {
  console.log('Catalog batch process triggered:', JSON.stringify(event, null, 2));

  const createdProducts = [];

  try {
    // Process each SQS message in the batch (up to 5 messages)
    for (const record of event.Records) {
      try {
        // Parse the product data from SQS message body
        const productData = JSON.parse(record.body);
        console.log('Processing product:', productData);

        // Validate required fields
        if (!productData.title || !productData.price) {
          console.error('Invalid product data - missing title or price:', productData);
          continue; // Skip invalid records but continue processing others
        }

        // Create product with generated UUID if not provided
        const product = {
          id: productData.id || randomUUID(), // Use provided ID or generate new one
          title: productData.title,
          description: productData.description || '',
          price: parseInt(productData.price) || 0, // Ensure price is a number
          image: productData.image || '',
        };

        // Save product to DynamoDB products table
        await docClient.send(new PutCommand({
          TableName: process.env.PRODUCTS_TABLE_NAME,
          Item: product,
        }));

        // Create corresponding stock entry
        const stockEntry = {
          product_id: product.id,
          count: parseInt(productData.count) || 0, // Default to 0 if no count provided
        };

        // Save stock entry to DynamoDB stock table
        await docClient.send(new PutCommand({
          TableName: process.env.STOCK_TABLE_NAME,
          Item: stockEntry,
        }));

        console.log(`Successfully created product: ${product.id} - ${product.title}`);
        createdProducts.push(product);

      } catch (recordError) {
        // Log error for individual record but continue processing others
        console.error('Error processing individual record:', recordError);
        console.error('Failed record:', record);
      }
    }

    // Send SNS notification if products were created
    if (createdProducts.length > 0) {
      const message = {
        productsCreated: createdProducts.length,
        products: createdProducts.map(p => ({ id: p.id, title: p.title, price: p.price })),
      };

      await snsClient.send(new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: `${createdProducts.length} New Product(s) Created`,
        Message: JSON.stringify(message, null, 2),
      }));

      console.log(`SNS notification sent for ${createdProducts.length} products`);
    }

    console.log(`Batch processing completed. Processed ${event.Records.length} messages.`);
    
    // Return success - SQS will delete processed messages
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully processed ${event.Records.length} product records`,
      }),
    };

  } catch (error) {
    // Log batch processing error
    console.error('Error in batch processing:', error);
    
    // Throw error to trigger SQS retry mechanism
    throw error;
  }
};