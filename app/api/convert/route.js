export const runtime = "edge";

export async function POST(request) {
  try {
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
    const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

    console.log('Environment variables check:', {
      hasCloudName: !!CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!CLOUDINARY_API_KEY,
      hasApiSecret: !!CLOUDINARY_API_SECRET
    });

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return new Response(
        JSON.stringify({ 
          error: "Missing Cloudinary credentials",
          details: "Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables" 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const format = formData.get("format");

    console.log('Request data:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      format: format
    });

    if (!file || !format) {
      return new Response(JSON.stringify({ error: "Missing file or format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const randomId = Math.random().toString(36).substring(7);
    const publicId = `temp_${timestamp}_${randomId}`;

    console.log('Upload preparation:', { publicId, timestamp });

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("public_id", publicId);
    cloudinaryForm.append("folder", "temp_conversions");

    const uploadData = {
      public_id: publicId,
      folder: "temp_conversions",
      timestamp: timestamp,
    };

    console.log('Generating signature for:', uploadData);
    const signature = await generateSignature(uploadData, CLOUDINARY_API_SECRET);
    console.log('Generated signature:', signature);

    cloudinaryForm.append("api_key", CLOUDINARY_API_KEY);
    cloudinaryForm.append("timestamp", timestamp.toString());
    cloudinaryForm.append("signature", signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    console.log('Uploading to:', uploadUrl);

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: cloudinaryForm,
    });

    console.log('Upload response status:', uploadRes.status);

    if (!uploadRes.ok) {
      const error = await uploadRes.text();
      console.error('Upload failed:', error);
      return new Response(
        JSON.stringify({ error: "Upload failed", details: error }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const uploadResult = await uploadRes.json();
    console.log('Upload result:', uploadResult);

  let transformedUrl;

  switch (format.toLowerCase()) {
    case "jpg":
    case "jpeg":
      transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_jpg,q_auto/${uploadResult.public_id}.jpg`;
      break;
    case "png":
      transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_png,q_auto/${uploadResult.public_id}.png`;
      break;
    case "webp":
      transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_webp,q_auto/${uploadResult.public_id}.webp`;
      break;
    case "avif":
      transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_avif,q_auto/${uploadResult.public_id}.avif`;
      break;
    case "gif":
      transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_gif/${uploadResult.public_id}.gif`;
      break;
    case "tiff":
    case "tif":
      transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_tiff,q_auto/${uploadResult.public_id}.tiff`;
      break;
    case "bmp":
      transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_bmp/${uploadResult.public_id}.bmp`;
      break;
    case "ico":
      transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_ico,w_256,h_256/${uploadResult.public_id}.ico`;
      break;
    default:
      transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_${format},q_auto/${uploadResult.public_id}.${format}`;
  }

    console.log('Generated URL:', transformedUrl);

    return new Response(
      JSON.stringify({
        url: transformedUrl,
        public_id: uploadResult.public_id,
        message: "Image will be deleted automatically after 24 hours",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      },
    );
  }
}

async function generateSignature(params, apiSecret) {
  try {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const stringToSign = sortedParams + apiSecret;

    console.log('String to sign:', stringToSign);

    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    
    return signature;
  } catch (error) {
    console.error('Signature generation error:', error);
    throw new Error(`Failed to generate signature: ${error.message}`);
  }
}
