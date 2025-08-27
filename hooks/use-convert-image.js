import { useState } from "react";
import { toast } from "sonner";
import useRecentImages from "./use-recent-images";

export default function useConvertImage() {
  const [format, setFormat] = useState("jpg");
  const [convertedUrl, setConvertedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addRecentImage } = useRecentImages();

  const formatOptions = [
    { value: "jpg", label: "JPG" },
    { value: "png", label: "PNG" },
    { value: "webp", label: "WEBP" },
    { value: "avif", label: "AVIF" },
    { value: "bmp", label: "BMP" },
    { value: "ico", label: "ICO" },
  ];

  const convertImage = async (file) => {
    if (!file) {
      toast.error("Please select a file to convert");
      return;
    }

    setLoading(true);
    setConvertedUrl(null);

    // Client-side validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      setLoading(false);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let responseData;
      try {
        responseData = await res.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response from server");
      }

      if (res.ok) {
        if (!responseData.url) {
          throw new Error("Server did not return a converted image URL");
        }

        setConvertedUrl(responseData.url);

        addRecentImage({
          type: "convert",
          originalName: file.name,
          resultUrl: responseData.url,
          format: format,
          action: `Converted to ${format.toUpperCase()}`,
          downloadName: `${file.name.split(".")[0]}-converted.${format}`,
        });

        toast.success("Image converted successfully!", {
          action: {
            label: "Close",
            onClick: () => {
              toast.dismiss();
            },
          },
        });
      } else {
        const errorMessage = responseData.details || responseData.error || "Conversion failed";
        const requestId = responseData.requestId ? ` (ID: ${responseData.requestId})` : "";
        
        console.error("Conversion failed:", {
          status: res.status,
          error: responseData.error,
          details: responseData.details,
          requestId: responseData.requestId,
          timestamp: responseData.timestamp
        });

        // Show user-friendly error messages
        if (res.status === 400) {
          toast.error(`Invalid request: ${errorMessage}`);
        } else if (res.status === 500) {
          if (errorMessage.includes("Missing required environment variables")) {
            toast.error("Service configuration error. Please contact support.");
          } else if (errorMessage.includes("Cloudinary")) {
            toast.error("Image processing service is temporarily unavailable. Please try again later.");
          } else {
            toast.error(`Conversion failed: ${errorMessage}${requestId}`);
          }
        } else {
          toast.error(`Conversion failed: ${errorMessage}${requestId}`);
        }
      }
    } catch (error) {
      console.error("Network or processing error:", error);
      
      if (error.name === 'AbortError') {
        toast.error("Conversion timed out. Please try with a smaller file or check your connection.");
      } else if (error.message.includes("Failed to fetch")) {
        toast.error("Network error. Please check your internet connection and try again.");
      } else {
        toast.error(`An error occurred: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadConvertedImage = async () => {
    if (!convertedUrl) {
      toast.error("No converted image available to download");
      return;
    }

    try {
      const response = await fetch(convertedUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `converted.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error(`Failed to download image: ${error.message}`);
    }
  };

  const clearConvertedImage = () => {
    setConvertedUrl(null);
  };

  return {
    format,
    convertedUrl,
    loading,
    formatOptions,
    setFormat,
    convertImage,
    downloadConvertedImage,
    clearConvertedImage,
  };
}
