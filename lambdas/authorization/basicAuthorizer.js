/**
 * basicAuthorizer - Lambda authorizer for Basic Authentication
 * 
 * Validates Basic Auth credentials against environment variables
 * Returns IAM policy allowing or denying API Gateway access
 */
exports.handler = async (event) => {
  console.log('Authorization event:', JSON.stringify(event, null, 2));

  if (event.type !== 'TOKEN') {
    throw new Error('Unauthorized');
  }

  try {
    const authorizationToken = event.authorizationToken;

    if (!authorizationToken) {
      console.log('No authorization token provided');
      throw new Error('Unauthorized');
    }

    // Extract credentials from Basic Auth header
    // Format: "Basic base64(username:password)"
    const encodedCreds = authorizationToken.replace('Basic ', '');
    const decodedCreds = Buffer.from(encodedCreds, 'base64').toString('utf-8');
    const [username, password] = decodedCreds.split(':');

    console.log(`Attempting authentication for user: ${username}`);

    // Check if credentials match environment variable
    const storedPassword = process.env[username];

    if (!storedPassword) {
      console.log(`User ${username} not found in environment variables`);
      return generatePolicy(username, 'Deny', event.methodArn);
    }

    if (storedPassword !== password) {
      console.log(`Invalid password for user ${username}`);
      return generatePolicy(username, 'Deny', event.methodArn);
    }

    console.log(`User ${username} authenticated successfully`);
    return generatePolicy(username, 'Allow', event.methodArn);

  } catch (error) {
    console.error('Authorization error:', error);
    throw new Error('Unauthorized');
  }
};

/**
 * Generate IAM policy for API Gateway
 */
function generatePolicy(principalId, effect, resource) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}
