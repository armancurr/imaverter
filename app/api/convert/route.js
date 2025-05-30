export const runtime = "edge";

export async function POST(request) {
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return new Response(
      JSON.stringify({ error: "Missing Cloudinary credentials" }),
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const format = formData.get("format");

  if (!file || !format) {
    return new Response(
      JSON.stringify({ error: "Missing file or format" }),
      { status: 400 }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const randomId = Math.random().toString(36).substring(7);
  const publicId = `temp_${timestamp}_${randomId}`;

  const cloudinaryForm = new FormData();
  cloudinaryForm.append("file", file);
  cloudinaryForm.append("public_id", publicId);
  cloudinaryForm.append("folder", "temp_conversions");

  const uploadData = {
    public_id: publicId,
    folder: "temp_conversions",
    timestamp: timestamp,
  };

  const signature = await generateSignature(uploadData, CLOUDINARY_API_SECRET);

  cloudinaryForm.append("api_key", CLOUDINARY_API_KEY);
  cloudinaryForm.append("timestamp", timestamp.toString());
  cloudinaryForm.append("signature", signature);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    body: cloudinaryForm,
  });

  if (!uploadRes.ok) {
    const error = await uploadRes.text();
    return new Response(
      JSON.stringify({ error: "Upload failed", details: error }),
      { status: 500 }
    );
  }

  const uploadResult = await uploadRes.json();

  let transformedUrl;
  if (format === "jpg" || format === "jpeg") {
    transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_jpg,q_auto/${uploadResult.public_id}.jpg`;
  } else {
    transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_${format},q_auto/${uploadResult.public_id}.${format}`;
  }

  return new Response(
    JSON.stringify({
      url: transformedUrl,
      public_id: uploadResult.public_id,
      message: "Image will be deleted automatically after 24 hours",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

async function generateSignature(params, apiSecret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const stringToSign = sortedParams + apiSecret;

  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}