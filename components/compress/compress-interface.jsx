"use client";

import { useState, useCallback, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import UploadCard from "@/components/shared/upload-card";
import ResultCard from "@/components/shared/result-card";
import { toast } from "sonner";
import NextImage from "next/image";

export default function CompressInterface() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compressedImage, setCompressedImage] = useState(null);

  const [quality, setQuality] = useState(80);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressionRatio, setCompressionRatio] = useState(0);
  const [estimatedSize, setEstimatedSize] = useState(0);

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

  useEffect(() => {
    if (originalSize > 0) {
      setEstimatedSize(estimateFileSize(quality, originalSize));
    }
  }, [quality, originalSize, estimateFileSize]);

  const compressImage = useCallback(async () => {
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

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality / 100);

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
  }, [file, preview, quality, originalSize]);

  const handleFileSelection = (selectedFile) => {
    if (selectedFile) {
      setOriginalSize(selectedFile.size);
    }
    setCompressedImage(null);
    setCompressedSize(0);
    setCompressionRatio(0);
  };

  const downloadCompressedImage = () => {
    if (!compressedImage) return;

    const a = document.createElement("a");
    a.href = compressedImage;
    a.download = `compressed-image-${quality}%.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const generateSizeMarkers = () => {
    if (!originalSize) return [];

    const markers = [];
    const qualityPoints = [20, 40, 60, 80, 95];

    qualityPoints.forEach((q, index) => {
      const size = estimateFileSize(q, originalSize);
      // Adjust positioning to prevent text overflow at edges
      let position = ((q - 10) / (95 - 10)) * 100;

      // Clamp positions to prevent text overflow
      if (index === 0) position = Math.max(position, 8); // First marker
      if (index === qualityPoints.length - 1) position = Math.min(position, 92); // Last marker

      markers.push({
        quality: q,
        size: formatFileSize(size),
        position: position,
      });
    });

    return markers;
  };

  const sizeMarkers = generateSizeMarkers();

  const previewArea = preview ? (
    <div className="flex-1 relative rounded-md overflow-hidden min-h-[280px] flex items-center justify-center">
      <NextImage
        src={preview}
        alt="Preview"
        width={800}
        height={600}
        className="max-w-full max-h-full object-contain"
        unoptimized
      />
    </div>
  ) : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      <div className="flex-1 grid grid-cols-1 gap-3 lg:grid-cols-2 min-h-0">
        <div className="h-full min-h-0">
          <UploadCard
            file={file}
            setFile={(newFile) => {
              setFile(newFile);
              handleFileSelection(newFile);
            }}
            preview={preview}
            dragActive={dragActive}
            setDragActive={setDragActive}
            setPreview={setPreview}
            loading={loading}
            onSubmit={compressImage}
            onClearResult={() => {
              setCompressedImage(null);
              setCompressedSize(0);
              setCompressionRatio(0);
            }}
            title="Compress Image"
            description="Upload an image to reduce its file size"
            buttonText="Compress Image"
            acceptedFormats="PNG, JPG, WEBP up to 10MB"
            customContent={previewArea}
          >
            {preview && originalSize > 0 && (
              <div className="border-2 border-neutral-700 rounded-lg p-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-neutral-300">
                      Target File Size
                    </Label>
                    <div className="text-xs text-neutral-400">
                      ~{formatFileSize(estimatedSize)}
                    </div>
                  </div>

                  <div className="relative">
                    <Slider
                      value={[quality]}
                      onValueChange={(values) => setQuality(values[0])}
                      min={10}
                      max={95}
                      step={1}
                      className="
    w-full
    [&_[data-slot=slider-track]]:bg-neutral-700
    [&_[data-slot=slider-range]]:bg-neutral-200
  "
                    />

                    <div className="relative mt-2 h-5 overflow-hidden">
                      {sizeMarkers.map((marker, index) => (
                        <div
                          key={index}
                          className="absolute transform -translate-x-1/2"
                          style={{ left: `${marker.position}%` }}
                        >
                          <div className="w-0.5 h-1.5 bg-neutral-500 mx-auto"></div>
                          <div className="text-[10px] text-neutral-500 mt-0.5 whitespace-nowrap">
                            {marker.size}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </UploadCard>
        </div>

        <div className="h-full min-h-0">
          <ResultCard
            resultUrl={compressedImage}
            resultFormat="jpg"
            originalSize={originalSize}
            compressedSize={compressedSize}
            compressionRatio={compressionRatio}
            onDownload={downloadCompressedImage}
            title="Compressed Result"
            successLabel="Compressed"
            noResultMessage="No compressed image yet"
            noResultSubMessage="Upload and compress an image to see it here"
            downloadButtonText="Download Compressed Image"
            toastMessage="Image compressed successfully!"
          />
        </div>
      </div>
    </div>
  );
}
