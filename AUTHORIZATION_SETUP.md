# Setting Authorization Token

To use the CSV import feature, you need to set the authorization token in your browser's localStorage.

## Steps

1. Open your browser's Developer Console (F12)
2. Go to the Console tab
3. Run the following command:

```javascript
// Set authorization token for user: Noemi_Verebelyi with password: TEST_PASSWORD
localStorage.setItem('authorization_token', 'Tm9lbWlfVmVyZWJlbHlpOlRFU1RfUEFTU1dPUkQ=');
```

4. Verify it was set:

```javascript
localStorage.getItem('authorization_token');
// Should return: Tm9lbWlfVmVyZWJlbHlpOlRFU1RfUEFTU1dPUkQ=
```

## How to Generate Your Own Token

If you need to generate a token for different credentials:

```javascript
// Replace with your GitHub username and password
const username = 'Noemi_Verebelyi';
const password = 'TEST_PASSWORD';
const token = btoa(`${username}:${password}`);
console.log('Your token:', token);
localStorage.setItem('authorization_token', token);
```

## Testing

After setting the token:
1. Go to the Product Import page
2. Select a CSV file
3. Click "Upload file"
4. The request will include the Authorization header: `Basic Tm9lbWlfVmVyZWJlbHlpOlRFU1RfUEFTU1dPUkQ=`

## Troubleshooting

If you get "Authorization token not found" error:
- Make sure you've set the token in localStorage
- Check the token value: `localStorage.getItem('authorization_token')`
- Refresh the page after setting the token

If you get 401 Unauthorized:
- The token is missing or malformed
- Set the token again using the commands above

If you get 403 Forbidden:
- The credentials are invalid
- Verify your username and password match the Lambda environment variables
