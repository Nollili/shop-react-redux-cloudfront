# Client Authorization Integration

## Overview

The client application now sends Basic Authorization headers when making requests to the `/import` endpoint of the Import Service API.

## Implementation

### CSVFileImport Component

The `CSVFileImport.tsx` component has been updated to:

1. **Retrieve token from localStorage**:
   ```typescript
   const authorizationToken = localStorage.getItem('authorization_token');
   ```

2. **Validate token exists**:
   ```typescript
   if (!authorizationToken) {
     alert('Authorization token not found. Please set it in localStorage.');
     return;
   }
   ```

3. **Send Authorization header**:
   ```typescript
   const response = await axios({
     method: "GET",
     url,
     params: { name: encodeURIComponent(file.name) },
     headers: {
       Authorization: `Basic ${authorizationToken}`,
     },
   });
   ```

## Setup Instructions

### Option 1: Using Browser Console

1. Open Developer Tools (F12)
2. Go to Console tab
3. Run:
   ```javascript
   localStorage.setItem('authorization_token', 'Tm9lbWlfVmVyZWJlbHlpOlRFU1RfUEFTU1dPUkQ=');
   ```

### Option 2: Using Auth Setup Page

1. Navigate to `/auth-setup.html`
2. Click "Set Authorization Token"
3. Click "Test Import API" to verify

### Option 3: Generate Custom Token

```javascript
const username = 'Noemi_Verebelyi';
const password = 'TEST_PASSWORD';
const token = btoa(`${username}:${password}`);
localStorage.setItem('authorization_token', token);
```

## Token Details

- **Username**: `Noemi_Verebelyi`
- **Password**: `TEST_PASSWORD`
- **Base64 Token**: `Tm9lbWlfVmVyZWJlbHlpOlRFU1RfUEFTU1dPUkQ=`
- **Storage**: Browser localStorage with key `authorization_token`

## Request Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Client   │───▶│  API Gateway     │───▶│ basicAuthorizer │
│  + Auth Token   │    │  /import         │    │     Lambda      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                        │
         │                       │                        ▼
         │                       │              ┌─────────────────┐
         │                       │              │  Validate Token │
         │                       │              │  Return Policy  │
         │                       │              └─────────────────┘
         │                       ▼                        │
         │              ┌──────────────────┐             │
         │              │ importProductsFile│◀───────────┘
         │              │     Lambda        │
         │              └──────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│  Upload to S3   │◀───│  Signed URL      │
│  using PUT      │    │  Response        │
└─────────────────┘    └──────────────────┘
```

## Error Handling

### No Token
```
Alert: "Authorization token not found. Please set it in localStorage."
```

### Invalid Token (403)
```
Error: Request failed with status code 403
Alert: "Error uploading file: Request failed with status code 403"
```

### Missing Authorization (401)
```
Error: Request failed with status code 401
Alert: "Error uploading file: Request failed with status code 401"
```

## Testing

### Test Valid Authorization
```bash
# Set token in console
localStorage.setItem('authorization_token', 'Tm9lbWlfVmVyZWJlbHlpOlRFU1RfUEFTU1dPUkQ=');

# Upload a CSV file through the UI
# Should succeed with "File uploaded successfully!"
```

### Test Invalid Authorization
```bash
# Set invalid token
localStorage.setItem('authorization_token', 'aW52YWxpZDppbnZhbGlk');

# Try to upload
# Should fail with 403 error
```

### Test Missing Authorization
```bash
# Clear token
localStorage.removeItem('authorization_token');

# Try to upload
# Should show alert: "Authorization token not found..."
```

## Security Considerations

- ✅ Token stored in localStorage (persists across sessions)
- ✅ Token sent only to authorized endpoints
- ✅ HTTPS required for production
- ⚠️ localStorage accessible via JavaScript (XSS risk)
- ⚠️ Consider using httpOnly cookies for production

## Production Recommendations

1. **Use Environment Variables**: Store API URLs in `.env` files
2. **Implement Token Refresh**: Add token expiration and refresh logic
3. **Secure Storage**: Consider more secure storage options
4. **Error Boundaries**: Add React error boundaries for auth failures
5. **User Feedback**: Improve error messages and user guidance
