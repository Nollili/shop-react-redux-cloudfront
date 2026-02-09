const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const csv = require('csv-parser');

// Initialize AWS clients
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

/**
 * importFileParser - Processes CSV files uploaded to S3 and sends records to SQS
 * 
 * This function is triggered automatically when files are uploaded to the 'uploaded/' folder
 * It reads the CSV file, parses each row, and sends product data to SQS for batch processing
 * 
 * Trigger: S3 ObjectCreated events in uploaded/ folder
 * Input: S3 event containing bucket name and object key
 * Output: Sends each CSV record to SQS catalogItemsQueue for batch processing
 */
exports.handler = async (event) => {
  console.log('Import file parser triggered:', JSON.stringify(event, null, 2));

  try {
    // Process each S3 record from the event
    // Multiple files can be uploaded simultaneously, so we handle all of them
    for (const record of event.Records) {
      const bucketName = record.s3.bucket.name;
      const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      
      console.log(`Processing file: ${objectKey} from bucket: ${bucketName}`);

      // Only process files in the uploaded/ folder
      if (!objectKey.startsWith('uploaded/')) {
        console.log(`Skipping file ${objectKey} - not in uploaded/ folder`);
        continue;
      }

      // Only process CSV files
      if (!objectKey.toLowerCase().endsWith('.csv')) {
        console.log(`Skipping file ${objectKey} - not a CSV file`);
        continue;
      }

      // Get the CSV file from S3
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      console.log(`Fetching file ${objectKey} from S3...`);
      const response = await s3Client.send(getObjectCommand);
      
      // Create a readable stream from the S3 object
      // This allows us to process large files without loading them entirely into memory
      const stream = response.Body;
      
      // Parse CSV data and send each record to SQS
      let recordCount = 0;
      let sentCount = 0;
      const records = []; // Collect all records first
      
      // First, collect all CSV records
      await new Promise((resolve, reject) => {
        stream
          .pipe(csv()) // Parse CSV format into JavaScript objects
          .on('data', (data) => {
            recordCount++;
            records.push(data); // Store record for processing
          })
          .on('end', () => {
            console.log(`Collected ${recordCount} records from ${objectKey}`);
            resolve();
          })
          .on('error', (error) => {
            console.error(`Error parsing CSV ${objectKey}:`, error);
            reject(error);
          });
      });
      
      // Then, send each record to SQS sequentially
      for (const data of records) {
        try {
          // Send each CSV record to SQS for batch processing
          // The catalogBatchProcess Lambda will create products from these messages
          const sendMessageCommand = new SendMessageCommand({
            QueueUrl: process.env.SQS_QUEUE_URL, // SQS queue URL from environment
            MessageBody: JSON.stringify(data), // CSV record as JSON string
            MessageAttributes: {
              // Add metadata about the source file
              sourceFile: {
                DataType: 'String',
                StringValue: objectKey,
              },
              recordNumber: {
                DataType: 'Number',
                StringValue: (sentCount + 1).toString(),
              },
            },
          });
          
          await sqsClient.send(sendMessageCommand);
          sentCount++;
          
          // Log progress every 10 records to avoid excessive logging
          if (sentCount % 10 === 0) {
            console.log(`Sent ${sentCount} records to SQS`);
          }
          
        } catch (sqsError) {
          console.error(`Error sending record to SQS:`, sqsError);
          // Continue processing other records even if one fails
        }
      }
      
      console.log(`Finished processing ${objectKey}. Total records: ${recordCount}, Sent to SQS: ${sentCount}`);
    }

    console.log('All files processed successfully');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Files processed and sent to SQS successfully'
      }),
    };

  } catch (error) {
    console.error('Error processing files:', error);
    
    // Return error but don't throw - this prevents infinite retries
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing files',
        error: error.message
      }),
    };
  }
};