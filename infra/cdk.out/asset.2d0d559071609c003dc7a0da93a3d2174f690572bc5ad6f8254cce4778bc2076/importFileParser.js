const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const csv = require('csv-parser');

// Initialize S3 client for reading uploaded files
const s3Client = new S3Client({ region: process.env.AWS_REGION });

/**
 * importFileParser - Processes CSV files uploaded to S3
 * 
 * This function is triggered automatically when files are uploaded to the 'uploaded/' folder
 * It reads the CSV file, parses each row, and logs the data for processing
 * 
 * Trigger: S3 ObjectCreated events in uploaded/ folder
 * Input: S3 event containing bucket name and object key
 * Output: Logs each CSV record to CloudWatch
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
      
      // Parse CSV data using csv-parser package
      // This processes the file row by row and emits events for each record
      let recordCount = 0;
      
      await new Promise((resolve, reject) => {
        stream
          .pipe(csv()) // Parse CSV format into JavaScript objects
          .on('data', (data) => {
            recordCount++;
            // Log each CSV record for visibility in CloudWatch
            // In a real application, this is where you'd process/validate/store the data
            console.log(`Record ${recordCount}:`, JSON.stringify(data, null, 2));
          })
          .on('end', () => {
            console.log(`Finished processing ${objectKey}. Total records: ${recordCount}`);
            resolve();
          })
          .on('error', (error) => {
            console.error(`Error parsing CSV ${objectKey}:`, error);
            reject(error);
          });
      });
    }

    console.log('All files processed successfully');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Files processed successfully'
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