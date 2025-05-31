export const runtime = "edge";

export async function GET(request) {
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
  const CRON_SECRET = process.env.CRON_SECRET;

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    const isoDate = oneHourAgo.toISOString().split(".")[0];

    const searchUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/search`;
    const expression = `folder:temp_conversions AND uploaded_at<${isoDate}`;
    const searchParams = {
      expression,
      max_results: 100,
      resource_type: "image",
    };

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await generateSignature(
      {
        expression,
        max_results: 100,
        resource_type: "image",
        timestamp,
      },
      CLOUDINARY_API_SECRET,
    );

    const form = new FormData();
    form.append("expression", expression);
    form.append("max_results", "100");
    form.append("resource_type", "image");
    form.append("api_key", CLOUDINARY_API_KEY);
    form.append("timestamp", timestamp.toString());
    form.append("signature", signature);

    const searchRes = await fetch(searchUrl, {
      method: "POST",
      body: form,
    });

    if (!searchRes.ok) {
      const error = await searchRes.text();
      return new Response(
        JSON.stringify({ error: "Search failed", details: error }),
        { status: 500 },
      );
    }

    const searchResult = await searchRes.json();
    const resources = searchResult.resources || [];

    let deleted = 0;
    for (const resource of resources) {
      const delTimestamp = Math.floor(Date.now() / 1000);
      const delSignature = await generateSignature(
        {
          public_id: resource.public_id,
          timestamp: delTimestamp,
        },
        CLOUDINARY_API_SECRET,
      );

      const delForm = new FormData();
      delForm.append("public_id", resource.public_id);
      delForm.append("api_key", CLOUDINARY_API_KEY);
      delForm.append("timestamp", delTimestamp.toString());
      delForm.append("signature", delSignature);

      const delUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`;
      await fetch(delUrl, {
        method: "POST",
        body: delForm,
      });
      deleted++;
    }

    return new Response(
      JSON.stringify({ deleted, message: "Cleanup complete" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
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
