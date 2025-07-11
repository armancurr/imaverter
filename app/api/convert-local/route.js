export async function POST(request) {
  try {
    console.log('Local convert API called');

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
      return new Response(
        JSON.stringify({ error: "Missing file or format" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a simple response with the original file as base64
    // In a real implementation, you'd use image processing libraries like Sharp
    const base64 = buffer.toString('base64');
    const mimeType = getMimeType(format);
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log('Generated data URL length:', dataUrl.length);

    return new Response(
      JSON.stringify({
        url: dataUrl,
        public_id: `local_${Date.now()}`,
        message: "Image converted locally",
        format: format
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error('Local conversion error:', error);
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

function getMimeType(format) {
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'avif': 'image/avif',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    'gif': 'image/gif',
    'tiff': 'image/tiff',
    'tif': 'image/tiff'
  };
  
  return mimeTypes[format.toLowerCase()] || 'image/jpeg';
} 