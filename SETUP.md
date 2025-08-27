# Imaverter Setup Guide

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the root directory with your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Getting Cloudinary Credentials

1. Sign up for a free account at [Cloudinary](https://cloudinary.com)
2. Go to your [Cloudinary Console](https://cloudinary.com/console)
3. Copy the credentials from your dashboard:
   - **Cloud Name**: Found at the top of your dashboard
   - **API Key**: Found in the "Account Details" section
   - **API Secret**: Click "Reveal" next to API Secret (keep this secure!)

### Quick Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your actual Cloudinary credentials

3. Restart your development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

## Troubleshooting

### "Missing Cloudinary credentials" Error

- **Cause**: Environment variables are not set or not accessible
- **Solution**: 
  1. Ensure `.env.local` exists in the root directory
  2. Verify all three variables are set correctly
  3. Restart your development server
  4. Check that there are no extra spaces or quotes around values

### "Service configuration error" Message

- **Cause**: Missing environment variables on the server
- **Solution**: Contact the administrator to configure Cloudinary credentials

### File Upload Errors

- **File size limit**: Maximum 10MB per file
- **Supported formats**: JPG, PNG, WEBP, AVIF, GIF, TIFF, BMP, ICO
- **Supported input types**: All common image MIME types

## Development

### Error Logging

The application includes comprehensive error logging. Check your browser console and server logs for detailed error information including:

- Request IDs for tracking
- Detailed error messages
- Timestamps
- Stack traces (in development)

### Testing the API

You can test the conversion API directly:

```bash
curl -X POST http://localhost:3000/api/convert \
  -F "file=@path/to/your/image.jpg" \
  -F "format=png"
```

Successful response:
```json
{
  "url": "https://res.cloudinary.com/...",
  "public_id": "temp_...",
  "format": "png",
  "originalName": "image.jpg",
  "message": "Image will be deleted automatically after 24 hours",
  "requestId": "abc123"
}
```

Error response:
```json
{
  "error": "File validation failed",
  "details": "File size exceeds 10MB limit",
  "requestId": "abc123",
  "timestamp": "2025-01-27T..."
}
```