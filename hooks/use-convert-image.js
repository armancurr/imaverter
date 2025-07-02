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
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setConvertedUrl(data.url);

        addRecentImage({
          type: "convert",
          originalName: file.name,
          resultUrl: data.url,
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
        const errorData = await res.json();
        console.error("Conversion failed:", errorData);
        toast.error(
          `Conversion failed: ${errorData.error}${
            errorData.details ? "\n\n" + errorData.details : ""
          }`,
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("An error occurred during conversion!");
    } finally {
      setLoading(false);
    }
  };

  const downloadConvertedImage = async () => {
    if (!convertedUrl) return;

    try {
      const response = await fetch(convertedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `converted.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
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
