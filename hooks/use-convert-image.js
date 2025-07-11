import { useState } from "react";
import { toast } from "sonner";
import useRecentImages from "./use-recent-images";
import JSZip from "jszip";

export default function useConvertImage() {
  const [format, setFormat] = useState("jpg");
  const [convertedImages, setConvertedImages] = useState([]); // Changed to array
  const [loading, setLoading] = useState(false);
  const [conversionProgress, setConversionProgress] = useState({ current: 0, total: 0 });
  const { addRecentImage } = useRecentImages();

  const formatOptions = [
    { value: "jpg", label: "JPG" },
    { value: "png", label: "PNG" },
    { value: "webp", label: "WEBP" },
    { value: "avif", label: "AVIF" },
    { value: "bmp", label: "BMP" },
    { value: "ico", label: "ICO" },
  ];

  const convertImage = async (files) => {
    // Handle both single file and array
    const fileArray = Array.isArray(files) ? files : [files];
    
    if (!fileArray.length) return;

    setLoading(true);
    setConvertedImages([]);
    setConversionProgress({ current: 0, total: fileArray.length });

    const results = [];
    const errors = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setConversionProgress({ current: i + 1, total: fileArray.length });

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("format", format);

          // Try the main Cloudinary API first, fall back to local processing
          let res = await fetch("/api/convert", {
            method: "POST",
            body: formData,
          });

          // If Cloudinary fails (missing credentials), use local processing
          if (!res.ok && res.status === 500) {
            console.log('Cloudinary API failed, trying local conversion...');
            
            // Show warning about limited functionality
            toast.error("Using local conversion (limited format support)", {
              description: "Set up Cloudinary credentials for full functionality",
              action: { label: "Close", onClick: () => toast.dismiss() },
            });
            
            res = await fetch("/api/convert-local", {
              method: "POST",
              body: formData,
            });
          }

          if (res.ok) {
            const data = await res.json();
            const result = {
              originalName: file.name,
              url: data.url,
              publicId: data.public_id,
              format: format,
              success: true,
            };
            
            results.push(result);

            // Add to recent images
            addRecentImage({
              type: "convert",
              originalName: file.name,
              resultUrl: data.url,
              format: format,
              action: `Converted to ${format.toUpperCase()}`,
              downloadName: `${file.name.split(".")[0]}-converted.${format}`,
            });
          } else {
            const errorData = await res.json();
            console.error(`Conversion failed for ${file.name}:`, errorData);
            errors.push(`${file.name}: ${errorData.error}`);
            results.push({
              originalName: file.name,
              error: errorData.error,
              success: false,
            });
          }
        } catch (fileError) {
          console.error(`Network error for ${file.name}:`, fileError);
          errors.push(`${file.name}: Network error`);
          results.push({
            originalName: file.name,
            error: "Network error",
            success: false,
          });
        }
      }

      setConvertedImages(results);

      // Show appropriate toast messages
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      if (successCount > 0 && failureCount === 0) {
        toast.success(
          successCount === 1 
            ? "Image converted successfully!" 
            : `All ${successCount} images converted successfully!`,
          {
            action: { label: "Close", onClick: () => toast.dismiss() },
          }
        );
      } else if (successCount > 0 && failureCount > 0) {
        toast.warning(
          `${successCount} converted, ${failureCount} failed`,
          {
            description: errors.slice(0, 2).join(", ") + (errors.length > 2 ? "..." : ""),
            action: { label: "Close", onClick: () => toast.dismiss() },
          }
        );
      } else {
        toast.error(
          failureCount === 1 
            ? "Conversion failed" 
            : `All ${failureCount} conversions failed`,
          {
            description: errors.slice(0, 2).join(", ") + (errors.length > 2 ? "..." : ""),
            action: { label: "Close", onClick: () => toast.dismiss() },
          }
        );
      }
    } catch (error) {
      console.error("Batch conversion error:", error);
      toast.error("An error occurred during conversion!");
    } finally {
      setLoading(false);
      setConversionProgress({ current: 0, total: 0 });
    }
  };

  const downloadConvertedImage = async (index = null) => {
    try {
      // Validate convertedImages array exists and has content
      if (!convertedImages || !Array.isArray(convertedImages) || convertedImages.length === 0) {
        console.log("No converted images available");
        toast.error("No converted images available for download");
        return;
      }

      let imagesToDownload;
      
      if (index !== null) {
        // Single image download - validate the index and image
        if (index < 0 || index >= convertedImages.length || !convertedImages[index]) {
          toast.error("Image not found for download");
          return;
        }
        const image = convertedImages[index];
        if (!image.success || !image.url) {
          toast.error("Selected image is not available for download");
          return;
        }
        imagesToDownload = [image];
      } else {
        // Multiple images download - filter successful ones
        imagesToDownload = convertedImages.filter(img => img && img.success && img.url);
      }
      
      if (imagesToDownload.length === 0) {
        toast.error("No successful conversions available for download");
        return;
      }

      if (imagesToDownload.length === 1) {
        // Single image - download directly
        const image = imagesToDownload[0];
        const a = document.createElement("a");
        
        if (image.url.startsWith('data:')) {
          a.href = image.url;
        } else {
          const response = await fetch(image.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 1000);
        }
        
        a.download = `${image.originalName.split(".")[0]}-converted.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast.success("Image downloaded successfully!");
      } else {
        // Multiple images - create ZIP file
        const zip = new JSZip();
        
        // Add all images to the ZIP
        for (const image of imagesToDownload) {
          try {
            let blob;
            
            if (image.url.startsWith('data:')) {
              // Convert data URL to blob
              const response = await fetch(image.url);
              blob = await response.blob();
            } else {
              // Fetch regular URL
              const response = await fetch(image.url);
              if (!response.ok) {
                throw new Error(`Failed to fetch ${image.originalName}: ${response.status}`);
              }
              blob = await response.blob();
            }
            
            const fileName = `${image.originalName.split(".")[0]}-converted.${format}`;
            zip.file(fileName, blob);
          } catch (imageError) {
            console.error(`Failed to add ${image.originalName} to ZIP:`, imageError);
            toast.error(`Failed to include ${image.originalName} in download`);
          }
        }
        
        // Generate ZIP file and download
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = window.URL.createObjectURL(zipBlob);
        
        const a = document.createElement("a");
        a.href = zipUrl;
        a.download = `converted-images-${format}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        setTimeout(() => {
          window.URL.revokeObjectURL(zipUrl);
        }, 1000);
        
        toast.success(`Downloaded ${imagesToDownload.length} images as ZIP file!`);
      }
    } catch (globalError) {
      console.error("Global error in downloadConvertedImage:", globalError);
      toast.error("Download failed: " + globalError.message);
    }
  };

  const clearConvertedImage = () => {
    setConvertedImages([]);
    setConversionProgress({ current: 0, total: 0 });
  };

  // Legacy support - return first successful image URL for existing ResultCard
  // This enables the download button when ANY conversion succeeds
  const successfulImage = convertedImages.find(img => img && img.success);
  const convertedUrl = successfulImage ? successfulImage.url : null;

  return {
    format,
    convertedUrl, // For backward compatibility
    convertedImages, // New array of results
    loading,
    conversionProgress,
    formatOptions,
    setFormat,
    convertImage,
    downloadConvertedImage,
    clearConvertedImage,
  };
}
