const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize S3 client for generating signed URLs
const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  console.log('Import products file request:', JSON.stringify(event, null, 2));

  try {
    // Extract fileName from query string parameters
    // Frontend will call GET /import?name=products.csv
    const fileName = event.queryStringParameters?.name;
    
    if (!fileName) {
      // Return error if fileName parameter is missing
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
        body: JSON.stringify({
          message: 'Missing required parameter: name'
        }),
      };
    }

    // Get S3 bucket name from environment variable (set in CDK stack)
    const bucketName = process.env.BUCKET_NAME;
    
    // Create S3 key with uploaded/ prefix as specified in requirements
    // This organizes files in the bucket under uploaded/ folder
    const s3Key = `uploaded/${fileName}`;

    // Create S3 PutObject command for generating signed URL
    // This allows frontend to upload files directly to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      // Set content type for CSV files
      ContentType: 'text/csv',
    });

    // Generate signed URL that expires in 15 minutes
    // This URL allows secure file upload without exposing AWS credentials
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 900 // 15 minutes
    });

    console.log('Generated signed URL for:', s3Key);

    // Return the signed URL to frontend
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({
        signedUrl: signedUrl
      }),
    };

  } catch (error) {
    console.error('Error generating signed URL:', error);
    
    // Return error response if signed URL generation fails
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message
      }),
    };
  }
};