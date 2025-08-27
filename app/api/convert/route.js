import { APIError, createErrorResponse, validateEnvironmentVariables } from '../../../lib/error-handler.js';

const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'tiff', 'tif', 'bmp', 'ico'];
const SUPPORTED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 
  'image/tiff', 'image/bmp', 'image/x-icon', 'image/vnd.microsoft.icon'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file) {
  if (!file) {
    throw new APIError('No file provided', 400);
  }

  if (!(file instanceof File)) {
    throw new APIError('Invalid file object', 400);
  }

  if (file.size === 0) {
    throw new APIError('File is empty', 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new APIError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`, 400);
  }

  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    throw new APIError(`Unsupported file type: ${file.type}. Supported types: ${SUPPORTED_MIME_TYPES.join(', ')}`, 400);
  }
}

function validateFormat(format) {
  if (!format || typeof format !== 'string') {
    throw new APIError('No output format specified', 400);
  }

  const normalizedFormat = format.toLowerCase().trim();
  if (!SUPPORTED_FORMATS.includes(normalizedFormat)) {
    throw new APIError(`Unsupported output format: ${format}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`, 400);
  }

  return normalizedFormat;
}

async function parseCloudinaryError(response) {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      return errorData.error?.message || JSON.stringify(errorData);
    } else {
      return await response.text();
    }
  } catch (parseError) {
    return `Failed to parse error response: ${parseError.message}`;
  }
}

function buildTransformationUrl(cloudName, publicId, format) {
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  switch (format) {
    case 'jpg':
    case 'jpeg':
      return `${baseUrl}/f_jpg,q_auto/${publicId}.jpg`;
    case 'png':
      return `${baseUrl}/f_png,q_auto/${publicId}.png`;
    case 'webp':
      return `${baseUrl}/f_webp,q_auto/${publicId}.webp`;
    case 'avif':
      return `${baseUrl}/f_avif,q_auto/${publicId}.avif`;
    case 'gif':
      return `${baseUrl}/f_gif/${publicId}.gif`;
    case 'tiff':
    case 'tif':
      return `${baseUrl}/f_tiff,q_auto/${publicId}.tiff`;
    case 'bmp':
      return `${baseUrl}/f_bmp/${publicId}.bmp`;
    case 'ico':
      return `${baseUrl}/f_ico,w_48,h_48,c_fit,b_white/${publicId}.ico`;
    default:
      return `${baseUrl}/f_${format},q_auto/${publicId}.${format}`;
  }
}

// Use Node.js crypto instead of Web Crypto API for better compatibility
async function generateSignature(params, apiSecret) {
  const crypto = require('crypto');
  
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const stringToSign = sortedParams + apiSecret;

  return crypto.createHash('sha1').update(stringToSign).digest('hex');
}

export async function POST(request) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] Starting conversion request`);
    
    // Validate environment - this will throw APIError if invalid
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = validateEnvironmentVariables();

    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      throw new APIError('Invalid form data', 400, 'Unable to parse multipart form data', requestId);
    }

    const file = formData.get("file");
    const format = formData.get("format");

    console.log(`[${requestId}] File info:`, {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      format
    });

    // Validate inputs - these will throw APIError if invalid
    validateFile(file);
    const validatedFormat = validateFormat(format);

    // Generate upload parameters
    const timestamp = Math.floor(Date.now() / 1000);
    const randomId = Math.random().toString(36).substring(7);
    const publicId = `temp_${timestamp}_${randomId}`;

    // Prepare upload data
    const uploadData = {
      public_id: publicId,
      folder: "temp_conversions",
      timestamp: timestamp,
    };

    console.log(`[${requestId}] Upload data:`, uploadData);

    // Generate signature
    let signature;
    try {
      signature = await generateSignature(uploadData, CLOUDINARY_API_SECRET);
    } catch (error) {
      throw new APIError('Signature generation failed', 500, error.message, requestId);
    }

    // Prepare Cloudinary form data
    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("public_id", publicId);
    cloudinaryForm.append("folder", "temp_conversions");
    cloudinaryForm.append("api_key", CLOUDINARY_API_KEY);
    cloudinaryForm.append("timestamp", timestamp.toString());
    cloudinaryForm.append("signature", signature);

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    console.log(`[${requestId}] Uploading to Cloudinary...`);
    
    let uploadRes;
    try {
      uploadRes = await fetch(uploadUrl, {
        method: "POST",
        body: cloudinaryForm,
      });
    } catch (error) {
      throw new APIError('Upload request failed', 500, 'Failed to connect to Cloudinary service', requestId);
    }

    // Handle upload response
    if (!uploadRes.ok) {
      const errorDetails = await parseCloudinaryError(uploadRes);
      throw new APIError('Upload to Cloudinary failed', 500, errorDetails, requestId);
    }

    // Parse upload result
    let uploadResult;
    try {
      uploadResult = await uploadRes.json();
    } catch (error) {
      throw new APIError('Failed to parse upload response', 500, error.message, requestId);
    }

    console.log(`[${requestId}] Upload successful:`, uploadResult.public_id);

    // Validate upload result
    if (!uploadResult.public_id) {
      throw new APIError('Upload incomplete', 500, 'Cloudinary did not return a public_id', requestId);
    }

    // Build transformation URL
    const transformedUrl = buildTransformationUrl(CLOUDINARY_CLOUD_NAME, uploadResult.public_id, validatedFormat);

    console.log(`[${requestId}] Conversion successful:`, transformedUrl);

    // Return success response
    return new Response(
      JSON.stringify({
        url: transformedUrl,
        public_id: uploadResult.public_id,
        format: validatedFormat,
        originalName: file.name,
        message: "Image will be deleted automatically after 24 hours",
        requestId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    return createErrorResponse(error, requestId);
  }
}
