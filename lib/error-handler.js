// lib/error-handler.js
export class APIError extends Error {
  constructor(message, statusCode = 500, details = null, requestId = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
    this.requestId = requestId;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      error: this.message,
      details: this.details,
      requestId: this.requestId,
      timestamp: this.timestamp,
      statusCode: this.statusCode
    };
  }
}

export function createErrorResponse(error, requestId = null) {
  let statusCode = 500;
  let errorMessage = 'Internal server error';
  let details = null;

  if (error instanceof APIError) {
    statusCode = error.statusCode;
    errorMessage = error.message;
    details = error.details;
  } else if (error.message) {
    errorMessage = error.message;
    details = error.stack;
  }

  const errorResponse = {
    error: errorMessage,
    details,
    requestId: requestId || Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString()
  };

  // Log the error for monitoring
  console.error('API Error:', JSON.stringify({
    ...errorResponse,
    stack: error.stack
  }, null, 2));

  return new Response(
    JSON.stringify(errorResponse),
    {
      status: statusCode,
      headers: { "Content-Type": "application/json" }
    }
  );
}

export function validateEnvironmentVariables() {
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

  const missing = [];
  if (!CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
  if (!CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');

  if (missing.length > 0) {
    throw new APIError(
      `Missing required environment variables: ${missing.join(', ')}. Please check your .env.local file and restart the server.`,
      500,
      'Environment configuration error'
    );
  }

  return { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET };
}