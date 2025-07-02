import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import useRecentImages from "./use-recent-images";

export default function useCompressImage() {
  const [loading, setLoading] = useState(false);
  const [compressedImage, setCompressedImage] = useState(null);
  const [quality, setQuality] = useState(80);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressionRatio, setCompressionRatio] = useState(0);
  const [estimatedSize, setEstimatedSize] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const { addRecentImage } = useRecentImages();

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + " " + sizes[i];
  };

  const estimateFileSize = useCallback((qualityPercent, originalBytes) => {
    if (!originalBytes) return 0;
    const compressionFactor = qualityPercent / 100;
    const baseCompression = 0.3;
    const estimatedBytes = originalBytes * baseCompression * compressionFactor;
    return Math.round(estimatedBytes);
  }, []);

  const generateSizeMarkers = useCallback(() => {
    if (!originalSize) return [];

    const markers = [];
    const qualityPoints = [20, 40, 60, 80, 95];

    qualityPoints.forEach((q, index) => {
      const size = estimateFileSize(q, originalSize);

      let position = ((q - 10) / (95 - 10)) * 100;

      if (index === 0) position = Math.max(position, 8);
      if (index === qualityPoints.length - 1) position = Math.min(position, 92);

      markers.push({
        quality: q,
        size: formatFileSize(size),
        position: position,
      });
    });

    return markers;
  }, [originalSize, estimateFileSize, formatFileSize]);

  const updateFileSize = useCallback((file) => {
    if (file) {
      setOriginalSize(file.size);
      setCurrentFile(file);
    } else {
      setOriginalSize(0);
      setCurrentFile(null);
      setCompressedImage(null);
      setCompressedSize(0);
      setCompressionRatio(0);
    }
  }, []);

  useEffect(() => {
    if (originalSize > 0) {
      setEstimatedSize(estimateFileSize(quality, originalSize));
    }
  }, [quality, originalSize, estimateFileSize]);

  const compressImage = useCallback(
    async (file, preview) => {
      if (!file || !preview) return;

      setLoading(true);
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const image = new Image();

        image.onload = () => {
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;

          ctx.drawImage(image, 0, 0);

          const compressedDataUrl = canvas.toDataURL(
            "image/jpeg",
            quality / 100,
          );

          const compressedSizeBytes = Math.round(
            (compressedDataUrl.length * 3) / 4,
          );
          setCompressedSize(compressedSizeBytes);

          if (originalSize > 0) {
            const ratio =
              ((originalSize - compressedSizeBytes) / originalSize) * 100;
            setCompressionRatio(Math.max(0, ratio));
          }

          setCompressedImage(compressedDataUrl);

          addRecentImage({
            type: "compress",
            originalName: file.name,
            resultUrl: compressedDataUrl,
            format: "jpg",
            action: `Compressed ${quality}% quality`,
            downloadName: `${file.name.split(".")[0]}-compressed-${quality}%.jpg`,
          });

          toast.success("Image compressed successfully!", {
            action: {
              label: "Close",
              onClick: () => {
                toast.dismiss();
              },
            },
          });
        };

        image.src = preview;
      } catch (error) {
        console.error("Error compressing image:", error);
        toast.error("Failed to compress image");
      } finally {
        setLoading(false);
      }
    },
    [quality, originalSize, addRecentImage],
  );

  const downloadCompressedImage = () => {
    if (!compressedImage) return;

    try {
      const a = document.createElement("a");
      a.href = compressedImage;
      a.download = `compressed-image-${quality}%.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  const clearCompressedImage = () => {
    setCompressedImage(null);
    setCompressedSize(0);
    setCompressionRatio(0);
  };

  return {
    loading,
    compressedImage,
    quality,
    originalSize,
    compressedSize,
    compressionRatio,
    estimatedSize,
    setQuality,
    formatFileSize,
    generateSizeMarkers,
    updateFileSize,
    compressImage,
    downloadCompressedImage,
    clearCompressedImage,
  };
}
